import { getBroadcasterInstance } from "@/features/channels/broadcasters";
import { Delivery } from "@/generated/prisma/client";
import { Job,Worker } from "bullmq";
import prisma from "../prisma";
import { QUEUE_NAMES } from "./delivery-queue";
import { createRedisConnection } from "./redis";



let deliveryWorker: Worker<Delivery> | null = null;

/**
 * Process delivery jobs
 */
async function processDeliveryJob(
    job: Job<Delivery>,
): Promise<{ success: boolean; error?: string }> {
    const { id, routeId, eventId , messageContent} = job.data;


    console.log(
		`[WORKER] Processing delivery : ${job.id}, Event: ${eventId} via route: ${routeId}`,
	);
        // Create initial attempt record (will be processed by queue worker)
        const attempt = await prisma.attempt.create({
          data: {
            deliveryId: id,
            attemptNumber: (job.data.attemptCount || 0) + 1,
            trigger: "INITIAL",
            status: "PENDING",
          },
        });

    try {
        const routeWithChannel = await prisma.route.findUnique({
            where: { id: routeId },
            include: { channel: true },
        });

        if (!routeWithChannel) {
            throw new Error(`Route not found: ${routeId}`);
        }

        const channel = routeWithChannel.channel;

        if (channel.status !== "ACTIVE") {
            throw new Error(`Channel is not active: ${channel.id}`);
        }

        const broadcaster = getBroadcasterInstance(
            channel.type,
            channel.config as Record<string, unknown>,
            channel.credentials as Record<string, unknown>,
        );

        if (!broadcaster) {
            throw new Error(`Unsupported channel type: ${channel.type}`);
        }

        // Test connection before sending (optional, can be skipped for performance)
        const canConnect = await broadcaster.testConnection();
        if (!canConnect) {
            throw new Error(`Failed to connect to channel: ${channel.id}`);
        }

        // Send the message
        const response = await broadcaster.sendMessage(messageContent);

        await prisma.attempt.update({
            where: { id: attempt.id },
            data: {
                status: "SUCCESSFUL",
                responseBody: JSON.stringify(response),
            },
        });

        console.log(
            `[WORKER] Delivery processed: ${job.id}, Event: ${eventId} via route: ${routeId}`,
        );

        return { success: true };
    } catch (error) {
        console.error(`[WORKER] Delivery processing failed: ${job.id}`);
        console.error("[WORKER] Full error:", error);

        await prisma.attempt.update({
            where: { id: attempt.id },
            data: {
                status: "FAILED",
                errorMessage:
                    error instanceof Error ? error.message : "Unknown error",
            },
        });
        throw error; // Rethrow to trigger retry
    }
}


/**
 * Create and start the delivery notification worker
 */
export function startDeliveryWorker(): Worker<Delivery> {
    if (deliveryWorker) {
        return deliveryWorker;
    }

    deliveryWorker = new Worker<Delivery>(
        QUEUE_NAMES.DELIVERY_QUEUE,
        processDeliveryJob,
        {
            connection: createRedisConnection(),
            concurrency: 5, // Process up to 5 jobs concurrently
        },
    );

    deliveryWorker.on("completed", (job) => {
        console.log(`[WORKER] Job completed: ${job.id}`);
    });

    deliveryWorker.on("failed", (job, error) => {
        console.error(`[WORKER] Job failed: ${job?.id}`, error.message);
    });

    deliveryWorker.on("error", (error) => {
        console.error("[WORKER] Delivery worker error:", error.message);
    });

    console.log("[WORKER] Delivery worker started");
    return deliveryWorker;
}

/**
 * Start all notification workers
 */
export function startAllWorkers(): void {
    startDeliveryWorker();
    console.log("[WORKER] All delivery workers started");
}

/**
 * Stop all workers gracefully
 */
export async function stopAllWorkers(): Promise<void> {
    const stopPromises: Promise<void>[] = [];

    if (deliveryWorker) {
        stopPromises.push(deliveryWorker.close());
        deliveryWorker = null;
    }

    await Promise.all(stopPromises);
    console.log("[WORKER] All workers stopped");
}

/**
 * Check if workers are running
 */
export function areWorkersRunning(): boolean {
    return deliveryWorker !== null;
}