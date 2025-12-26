import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { verifySignature, extractEventType } from "@/lib/webhook-signature";
import { evaluateFilter } from "@/lib/filter-expression";

/**
 * POST /api/webhook/[orgSlug]/[endpointSlug]
 * 
 * Receive webhook events from providers (GitLab, GitHub, Jira, etc.)
 * 
 * Flow:
 * 1. Receive & Validate (verify signature, create Event)
 * 2. Route Matching (find matching routes, apply filters)
 * 3. Create Deliveries (one per matching route)
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orgSlug: string; endpointSlug: string }> }
) {
  try {
    const { orgSlug, endpointSlug } = await context.params;

    // ============================================
    // STEP 1: RECEIVE & VALIDATE
    // ============================================

    // Parse request
    const rawBody = await req.text();
    let body: Record<string, unknown>;
    
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Extract headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Look up Endpoint by org slug + endpoint slug
    const endpoint = await prisma.endpoint.findFirst({
      where: {
        slug: endpointSlug,
        organization: {
          slug: orgSlug,
        },
        status: "ACTIVE", // Only accept webhooks for active endpoints
      },
      include: {
        provider: true,
        organization: true,
      },
    });

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint not found or inactive" },
        { status: 404 }
      );
    }

    // Extract event type based on provider
    const eventType = extractEventType(headers, body, endpoint.provider.name);

    // Check if event type is allowed (if allowedEvents is configured)
    if (
      endpoint.allowedEvents.length > 0 &&
      !endpoint.allowedEvents.includes(eventType)
    ) {
      // Create event record with IGNORED status
      await prisma.event.create({
        data: {
          endpointId: endpoint.id,
          eventType,
          headers: headers as Prisma.JsonObject,
          body: body as Prisma.JsonObject,
          queryParams: {},
          sourceIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          userAgent: req.headers.get("user-agent") || undefined,
          signatureValid: null,
          status: "IGNORED",
        },
      });

      return NextResponse.json(
        { message: "Event type not allowed for this endpoint" },
        { status: 200 }
      );
    }

    // Verify signature
    let signatureValid = true;
    
    if (endpoint.provider.signatureAlgo && endpoint.provider.signatureAlgo !== "NONE") {
      const signatureHeader = endpoint.provider.signatureHeader;
      const signature = signatureHeader ? headers[signatureHeader.toLowerCase()] : null;

      signatureValid = verifySignature(
        rawBody,
        signature || null,
        endpoint.secret || "",
        endpoint.provider.signatureAlgo
      );

      if (!signatureValid) {
        // Create event record with INVALID status
        await prisma.event.create({
          data: {
            endpointId: endpoint.id,
            eventType,
            headers: headers as Prisma.JsonObject,
            body: body as Prisma.JsonObject,
            queryParams: {},
            sourceIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            userAgent: req.headers.get("user-agent") || undefined,
            signatureValid: false,
            status: "INVALID",
          },
        });

        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Create Event record with RECEIVED status
    const event = await prisma.event.create({
      data: {
        endpointId: endpoint.id,
        eventType,
        headers: headers as Prisma.JsonObject,
        body: body as Prisma.JsonObject,
        queryParams: {},
        sourceIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || undefined,
        signatureValid,
        status: "RECEIVED",
      },
    });

    // ============================================
    // STEP 2: ROUTE MATCHING
    // ============================================

    // Update event status to PROCESSING
    await prisma.event.update({
      where: { id: event.id },
      data: { status: "PROCESSING" },
    });

    // Find all active routes for this endpoint
    const routes = await prisma.route.findMany({
      where: {
        endpointId: endpoint.id,
        status: "ACTIVE",
        // Match event type if specified in route
        OR: [
          { eventType: eventType },
          { eventType: "*" }, // Wildcard matches all events
          { eventType: "" }, // Empty string also matches all
        ],
      },
      include: {
        channel: true,
        template: true,
      },
    });

    if (routes.length === 0) {
      // No matching routes
      await prisma.event.update({
        where: { id: event.id },
        data: { status: "IGNORED", processedAt: new Date() },
      });

      return NextResponse.json(
        { message: "No matching routes found" },
        { status: 200 }
      );
    }

    // ============================================
    // STEP 3: CREATE DELIVERIES
    // ============================================

    const matchedRoutes: typeof routes = [];

    for (const route of routes) {
      // Apply filter expression if exists
      if (route.filterExpression) {
        try {
          const matches = evaluateFilter(route.filterExpression, {
            headers,
            body,
            eventType,
          });

          if (!matches) {
            continue; // Skip this route
          }
        } catch (error) {
          console.error(`Filter evaluation error for route ${route.id}:`, error);
          continue; // Skip on error
        }
      }

      matchedRoutes.push(route);
    }

    if (matchedRoutes.length === 0) {
      // No routes matched after filtering
      await prisma.event.update({
        where: { id: event.id },
        data: { status: "IGNORED", processedAt: new Date() },
      });

      return NextResponse.json(
        { message: "No routes matched filter expressions" },
        { status: 200 }
      );
    }

    // Create deliveries for matching routes
    const deliveries = await Promise.all(
      matchedRoutes.map(async (route) => {
        // Check if channel is active
        if (route.channel.status !== "ACTIVE") {
          return null;
        }

        // Calculate scheduled time (if delay is configured)
        const scheduledFor = new Date(
          Date.now() + (route.delaySeconds || 0) * 1000
        );

        // Create delivery
        const delivery = await prisma.delivery.create({
          data: {
            eventId: event.id,
            routeId: route.id,
            status: route.delaySeconds > 0 ? "SCHEDULED" : "PENDING",
            scheduledFor,
            nextAttemptAt: scheduledFor,
            maxAttempts: route.retryCount || 5,
            attemptCount: 0,
          },
        });

        // Create initial attempt record (will be processed by queue worker)
        await prisma.attempt.create({
          data: {
            deliveryId: delivery.id,
            attemptNumber: 1,
            trigger: "INITIAL",
            status: "PENDING",
          },
        });

        return delivery;
      })
    );

    // Filter out null deliveries (inactive channels)
    const validDeliveries = deliveries.filter((d) => d !== null);

    // Update event status to PROCESSED
    await prisma.event.update({
      where: { id: event.id },
      data: { status: "PROCESSED", processedAt: new Date() },
    });

    return NextResponse.json(
      {
        success: true,
        eventId: event.id,
        deliveriesCreated: validDeliveries.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
