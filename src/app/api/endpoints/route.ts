import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  getAuthenticatedOrganization,
  unauthorizedResponse,
  badRequestResponse,
  successResponse,
  errorResponse,
} from "@/types/api";
import { createEndpointSchema } from "@/lib/validations/endpoint";

// GET /api/endpoints - List all endpoints for the current organization
export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedOrganization();

    if (!authContext) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const providerId = searchParams.get("providerId");

    const endpoints = await prisma.endpoint.findMany({
      where: {
        organizationId: authContext.organizationId,
        ...(status && { status: status as "ACTIVE" | "PAUSED" | "DISABLED" }),
        ...(providerId && { providerId }),
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            displayName: true,
            iconUrl: true,
          },
        },
        _count: {
          select: {
            events: true,
            routes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(endpoints);
  } catch (error) {
    console.error("Error fetching endpoints:", error);
    return errorResponse("Failed to fetch endpoints");
  }
}

// POST /api/endpoints - Create a new endpoint
export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedOrganization();

    if (!authContext) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const validatedFields = createEndpointSchema.safeParse(body);

    if (!validatedFields.success) {
      return badRequestResponse(
        validatedFields.error.errors[0]?.message || "Invalid input"
      );
    }

    const { name, slug, description, secret, providerId, allowedEvents } =
      validatedFields.data;

    // Check if slug is already taken within this organization
    const existingEndpoint = await prisma.endpoint.findFirst({
      where: {
        organizationId: authContext.organizationId,
        slug,
      },
    });

    if (existingEndpoint) {
      return badRequestResponse("An endpoint with this slug already exists");
    }

    // Verify provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return badRequestResponse("Invalid provider");
    }

    const endpoint = await prisma.endpoint.create({
      data: {
        name,
        slug,
        description,
        secret,
        providerId,
        organizationId: authContext.organizationId,
        allowedEvents,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            displayName: true,
            iconUrl: true,
          },
        },
      },
    });

    return successResponse(endpoint, 201);
  } catch (error) {
    console.error("Error creating endpoint:", error);
    return errorResponse("Failed to create endpoint");
  }
}
