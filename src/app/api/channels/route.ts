import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import {
  getAuthenticatedOrganization,
  unauthorizedResponse,
  badRequestResponse,
  successResponse,
  errorResponse,
} from "@/lib/api-utils";
import { createChannelSchema } from "@/lib/validations/channel";

// GET /api/channels - List all channels for the current organization
export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedOrganization();

    if (!authContext) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const channels = await prisma.channel.findMany({
      where: {
        organizationId: authContext.organizationId,
        ...(status && {
          status: status as "ACTIVE" | "PAUSED" | "DISABLED" | "ERROR",
        }),
        ...(type && { type: type as "TELEGRAM" | "SLACK" | "DISCORD" | "WEBHOOK" | "EMAIL" | "ROCKETCHAT" | "MATTERMOST" | "MICROSOFT_TEAMS" }),
      },
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
        // Don't expose credentials in list view
        _count: {
          select: {
            routes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    return errorResponse("Failed to fetch channels");
  }
}

// POST /api/channels - Create a new channel
export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedOrganization();

    if (!authContext) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const validatedFields = createChannelSchema.safeParse(body);

    if (!validatedFields.success) {
      return badRequestResponse(
        validatedFields.error.errors[0]?.message || "Invalid input"
      );
    }

    const { name, description, type, credentials, config, maxDeliveryRate } =
      validatedFields.data;

    // TODO: Encrypt credentials before storing
    // For now, store as-is (in production, use encryption)
    const channel = await prisma.channel.create({
      data: {
        name,
        description,
        type,
        credentials: credentials as Prisma.InputJsonValue,
        config: (config || {}) as Prisma.InputJsonValue,
        maxDeliveryRate,
        organizationId: authContext.organizationId,
      },
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

    return successResponse(channel, 201);
  } catch (error) {
    console.error("Error creating channel:", error);
    return errorResponse("Failed to create channel");
  }
}
