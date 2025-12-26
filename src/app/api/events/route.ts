import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  getAuthenticatedOrganization,
  unauthorizedResponse,
  cursorPaginatedResponse,
  errorResponse,
} from "@/types/api";

// GET /api/events - List all events for the current organization
export async function GET(req: NextRequest) {
  try {
    const authContext = await getAuthenticatedOrganization();

    if (!authContext) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const endpointId = searchParams.get("endpointId");
    const eventType = searchParams.get("eventType");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const cursor = searchParams.get("cursor");

    // First, get all endpoint IDs for this organization
    const endpoints = await prisma.endpoint.findMany({
      where: { organizationId: authContext.organizationId },
      select: { id: true },
    });

    const endpointIds = endpoints.map((e) => e.id);

    if (endpointIds.length === 0) {
      return cursorPaginatedResponse([], null);
    }

    const events = await prisma.event.findMany({
      where: {
        endpointId: endpointId ? endpointId : { in: endpointIds },
        ...(status && {
          status: status as
            | "RECEIVED"
            | "PROCESSING"
            | "PROCESSED"
            | "IGNORED"
            | "INVALID"
            | "ERROR",
        }),
        ...(eventType && { eventType }),
        ...(cursor && { id: { lt: cursor } }),
      },
      include: {
        endpoint: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
      orderBy: { receivedAt: "desc" },
      take: limit + 1, // Take one extra to determine if there are more
    });

    // Check if there are more events
    const hasMore = events.length > limit;
    const eventsToReturn = hasMore ? events.slice(0, limit) : events;
    const nextCursor = hasMore ? eventsToReturn[eventsToReturn.length - 1]?.id : null;

    return cursorPaginatedResponse(eventsToReturn, nextCursor);
  } catch (error) {
    console.error("Error fetching events:", error);
    return errorResponse("Failed to fetch events");
  }
}
