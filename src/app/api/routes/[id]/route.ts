import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  getAuthenticatedOrganization,
  unauthorizedResponse,
  notFoundResponse,
  badRequestResponse,
  successResponse,
  errorResponse,
} from "@/types/api";
import { updateRouteSchema } from "@/lib/validations/route";

// GET /api/routes/[id] - Get a single route
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authContext = await getAuthenticatedOrganization();

    if (!authContext) {
      return unauthorizedResponse();
    }

    const route = await prisma.route.findFirst({
      where: {
        id,
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
            config: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            template: true,
            format: true,
          },
        },
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
    });

    if (!route) {
      return notFoundResponse("Route");
    }

    return successResponse(route);
  } catch (error) {
    console.error("Error fetching route:", error);
    return errorResponse("Failed to fetch route");
  }
}

// PATCH /api/routes/[id] - Update a route
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authContext = await getAuthenticatedOrganization();

    if (!authContext) {
      return unauthorizedResponse();
    }

    // Check if route exists and belongs to organization
    const existingRoute = await prisma.route.findFirst({
      where: {
        id,
        organizationId: authContext.organizationId,
      },
    });

    if (!existingRoute) {
      return notFoundResponse("Route");
    }

    const body = await req.json();
    const validatedFields = updateRouteSchema.safeParse(body);

    if (!validatedFields.success) {
      return badRequestResponse(
        validatedFields.error.errors[0]?.message || "Invalid input"
      );
    }

    const updateData = validatedFields.data;

    // Verify template if being updated
    if (updateData.templateId) {
      const template = await prisma.messageTemplate.findFirst({
        where: {
          id: updateData.templateId,
          organizationId: authContext.organizationId,
        },
      });

      if (!template) {
        return badRequestResponse("Invalid template");
      }
    }

    const route = await prisma.route.update({
      where: { id },
      data: updateData,
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

    return successResponse(route);
  } catch (error) {
    console.error("Error updating route:", error);
    return errorResponse("Failed to update route");
  }
}

// DELETE /api/routes/[id] - Delete a route
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authContext = await getAuthenticatedOrganization();

    if (!authContext) {
      return unauthorizedResponse();
    }

    // Check if route exists and belongs to organization
    const route = await prisma.route.findFirst({
      where: {
        id,
        organizationId: authContext.organizationId,
      },
    });

    if (!route) {
      return notFoundResponse("Route");
    }

    await prisma.route.delete({
      where: { id },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Error deleting route:", error);
    return errorResponse("Failed to delete route");
  }
}
