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
import { updateChannelSchema } from "@/lib/validations/channel";

// GET /api/channels/[id] - Get a single channel
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

    const channel = await prisma.channel.findFirst({
      where: {
        id,
        organizationId: authContext.organizationId,
      },
      include: {
        _count: {
          select: {
            routes: true,
          },
        },
      },
    });

    if (!channel) {
      return notFoundResponse("Channel");
    }

    // Mask sensitive credentials
    const maskedCredentials = maskCredentials(channel.credentials as Record<string, unknown>);

    return successResponse({
      ...channel,
      credentials: maskedCredentials,
    });
  } catch (error) {
    console.error("Error fetching channel:", error);
    return errorResponse("Failed to fetch channel");
  }
}

// PATCH /api/channels/[id] - Update a channel
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

    // Check if channel exists and belongs to organization
    const existingChannel = await prisma.channel.findFirst({
      where: {
        id,
        organizationId: authContext.organizationId,
      },
    });

    if (!existingChannel) {
      return notFoundResponse("Channel");
    }

    const body = await req.json();
    const validatedFields = updateChannelSchema.safeParse(body);

    if (!validatedFields.success) {
      return badRequestResponse(
        validatedFields.error.errors[0]?.message || "Invalid input"
      );
    }

    const updateData = validatedFields.data;

    // If credentials are being updated, merge with existing
    let finalCredentials: unknown = existingChannel.credentials;
    if (updateData.credentials) {
      finalCredentials = {
        ...(existingChannel.credentials as Record<string, unknown>),
        ...updateData.credentials,
      };
    }

    // Build update data object, only including defined fields
    const updatePayload: Record<string, unknown> = {};
    if (updateData.name !== undefined) updatePayload.name = updateData.name;
    if (updateData.description !== undefined) updatePayload.description = updateData.description;
    if (updateData.config !== undefined) updatePayload.config = updateData.config;
    if (updateData.status !== undefined) updatePayload.status = updateData.status;
    if (updateData.maxDeliveryRate !== undefined) updatePayload.maxDeliveryRate = updateData.maxDeliveryRate;
    if (updateData.credentials !== undefined) updatePayload.credentials = finalCredentials;

    const channel = await prisma.channel.update({
      where: { id },
      data: updatePayload,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        config: true,
        status: true,
        maxDeliveryRate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(channel);
  } catch (error) {
    console.error("Error updating channel:", error);
    return errorResponse("Failed to update channel");
  }
}

// DELETE /api/channels/[id] - Delete a channel
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

    // Check if channel exists and belongs to organization
    const channel = await prisma.channel.findFirst({
      where: {
        id,
        organizationId: authContext.organizationId,
      },
    });

    if (!channel) {
      return notFoundResponse("Channel");
    }

    await prisma.channel.delete({
      where: { id },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Error deleting channel:", error);
    return errorResponse("Failed to delete channel");
  }
}

// Helper to mask sensitive credential values
function maskCredentials(credentials: Record<string, unknown>): Record<string, unknown> {
  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(credentials)) {
    if (typeof value === "string" && value.length > 0) {
      // Show first 4 and last 4 characters, mask the rest
      if (value.length > 12) {
        masked[key] = `${value.substring(0, 4)}${"*".repeat(8)}${value.substring(value.length - 4)}`;
      } else {
        masked[key] = "*".repeat(value.length);
      }
    } else {
      masked[key] = value;
    }
  }
  return masked;
}
