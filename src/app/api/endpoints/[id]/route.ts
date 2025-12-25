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
import { updateEndpointSchema } from "@/lib/validations/endpoint";

// GET /api/endpoints/[id] - Get a single endpoint
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

    const endpoint = await prisma.endpoint.findFirst({
      where: {
        id,
        organizationId: authContext.organizationId,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            displayName: true,
            iconUrl: true,
            signatureHeader: true,
            signatureAlgo: true,
          },
        },
        _count: {
          select: {
            events: true,
            routes: true,
          },
        },
      },
    });

    if (!endpoint) {
      return notFoundResponse("Endpoint");
    }

    return successResponse(endpoint);
  } catch (error) {
    console.error("Error fetching endpoint:", error);
    return errorResponse("Failed to fetch endpoint");
  }
}

// PATCH /api/endpoints/[id] - Update an endpoint
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

    // Check if endpoint exists and belongs to organization
    const existingEndpoint = await prisma.endpoint.findFirst({
      where: {
        id,
        organizationId: authContext.organizationId,
      },
    });

    if (!existingEndpoint) {
      return notFoundResponse("Endpoint");
    }

    const body = await req.json();
    const validatedFields = updateEndpointSchema.safeParse(body);

    if (!validatedFields.success) {
      return badRequestResponse(
        validatedFields.error.errors[0]?.message || "Invalid input"
      );
    }

    const updateData = validatedFields.data;

    // If slug is being updated, check for conflicts
    if (updateData.slug && updateData.slug !== existingEndpoint.slug) {
      const slugConflict = await prisma.endpoint.findFirst({
        where: {
          organizationId: authContext.organizationId,
          slug: updateData.slug,
          id: { not: id },
        },
      });

      if (slugConflict) {
        return badRequestResponse("An endpoint with this slug already exists");
      }
    }

    const endpoint = await prisma.endpoint.update({
      where: { id },
      data: updateData,
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

    return successResponse(endpoint);
  } catch (error) {
    console.error("Error updating endpoint:", error);
    return errorResponse("Failed to update endpoint");
  }
}

// DELETE /api/endpoints/[id] - Delete an endpoint
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

    // Check if endpoint exists and belongs to organization
    const endpoint = await prisma.endpoint.findFirst({
      where: {
        id,
        organizationId: authContext.organizationId,
      },
    });

    if (!endpoint) {
      return notFoundResponse("Endpoint");
    }

    await prisma.endpoint.delete({
      where: { id },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Error deleting endpoint:", error);
    return errorResponse("Failed to delete endpoint");
  }
}
