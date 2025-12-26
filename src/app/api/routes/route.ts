import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  getAuthenticatedOrganization,
  unauthorizedResponse,
  badRequestResponse,
  successResponse,
  errorResponse,
} from "@/types/api";
import { createRouteSchema } from "@/lib/validations/route";

// GET /api/routes - List all routes for the current organization
export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedOrganization();

    if (!authContext) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const endpointId = searchParams.get("endpointId");
    const channelId = searchParams.get("channelId");

    const routes = await prisma.route.findMany({
      where: {
        organizationId: authContext.organizationId,
        ...(status && { status: status as "ACTIVE" | "PAUSED" | "DISABLED" }),
        ...(endpointId && { endpointId }),
        ...(channelId && { channelId }),
      },
      include: {
        endpoint: {
          select: {
            id: true,
            name: true,
            slug: true,
            provider: {
              select: {
                id: true,
                name: true,
                displayName: true,
                iconUrl: true,
              },
            },
          },
        },
        channel: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    return successResponse(routes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    return errorResponse("Failed to fetch routes");
  }
}

// POST /api/routes - Create a new route
export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedOrganization();

    if (!authContext) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const validatedFields = createRouteSchema.safeParse(body);

    if (!validatedFields.success) {
      return badRequestResponse(
        validatedFields.error.errors[0]?.message || "Invalid input"
      );
    }

    const {
      name,
      description,
      endpointId,
      channelId,
      filterExpression,
      messageContent,
      delaySeconds,
      retryStrategy,
      retryCount,
      retryIntervalMs,
      priority,
      templateId,
    } = validatedFields.data;

    // Verify endpoint exists and belongs to organization
    const endpoint = await prisma.endpoint.findFirst({
      where: {
        id: endpointId,
        organizationId: authContext.organizationId,
      },
    });

    if (!endpoint) {
      return badRequestResponse("Invalid endpoint");
    }

    // Verify channel exists and belongs to organization
    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        organizationId: authContext.organizationId,
      },
    });

    if (!channel) {
      return badRequestResponse("Invalid channel");
    }

    // Verify template if provided
    if (templateId) {
      const template = await prisma.messageTemplate.findFirst({
        where: {
          id: templateId,
          organizationId: authContext.organizationId,
        },
      });

      if (!template) {
        return badRequestResponse("Invalid template");
      }
    }

    const route = await prisma.route.create({
      data: {
        name,
        description,
        endpointId,
        channelId,
        filterExpression,
        messageContent,
        delaySeconds,
        retryStrategy,
        retryCount,
        retryIntervalMs,
        priority,
        templateId,
        organizationId: authContext.organizationId,
      },
      include: {
        endpoint: {
          select: {
            id: true,
            name: true,
            slug: true,
            provider: {
              select: {
                id: true,
                name: true,
                displayName: true,
                iconUrl: true,
              },
            },
          },
        },
        channel: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(route, 201);
  } catch (error) {
    console.error("Error creating route:", error);
    return errorResponse("Failed to create route");
  }
}
