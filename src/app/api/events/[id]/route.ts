import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  getAuthenticatedOrganization,
  unauthorizedResponse,
  notFoundResponse,
  successResponse,
  errorResponse,
} from "@/lib/api-utils";

// GET /api/events/[id] - Get a single event with deliveries and attempts
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

    const event = await prisma.event.findFirst({
      where: { id },
      include: {
        endpoint: {
          select: {
            id: true,
            name: true,
            slug: true,
            organizationId: true,
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
        deliveries: {
          include: {
            route: {
              select: {
                id: true,
                name: true,
              },
            },
            attempts: {
              orderBy: { startedAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!event) {
      return notFoundResponse("Event");
    }

    // Verify the event belongs to an endpoint in the user's organization
    if (event.endpoint.organizationId !== authContext.organizationId) {
      return notFoundResponse("Event");
    }

    // Get the channel info for each delivery
    const deliveriesWithChannels = await Promise.all(
      event.deliveries.map(async (delivery) => {
        const route = await prisma.route.findUnique({
          where: { id: delivery.routeId },
          select: {
            channel: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        });

        return {
          ...delivery,
          channel: route?.channel || null,
        };
      })
    );

    return successResponse({
      ...event,
      deliveries: deliveriesWithChannels,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return errorResponse("Failed to fetch event");
  }
}
