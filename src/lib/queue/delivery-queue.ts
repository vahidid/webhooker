import { Delivery } from "@/generated/prisma/client";
import { JobsOptions, Queue } from "bullmq";
import { createRedisConnection } from "./redis";



export const QUEUE_NAMES = {
    DELIVERY_QUEUE: "delivery-queue",
} as const;


const defaultJobOptions: JobsOptions = {
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 1000,
    },
    removeOnComplete: {
        count: 1000, // Keep last 1000 completed jobs
        age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
        count: 5, // Keep last 5 failed jobs for debugging
        age: 7 * 24 * 3600, // Keep for 7 days
    },
};

let deliveryQueue: Queue<Delivery> | null = null;

export function getDeliveryQueue(): Queue<Delivery> {
    if (!deliveryQueue) {
        deliveryQueue = new Queue<Delivery>(
            QUEUE_NAMES.DELIVERY_QUEUE,
            {
                connection: createRedisConnection(),
                defaultJobOptions,
            },
        );
    }
    return deliveryQueue;
}

/**
 * Add a pharmacy notification job to the queue
 */
export async function addDeliveryJob(
    data: Delivery,
    options?: { delay?: number; priority?: number },
): Promise<string> {
    const queue = getDeliveryQueue();
    const jobId = `delivery-${data.id}-${data.routeId}-${Date.now()}`;

    const job = await queue.add(
        `delivery-job-${data.id}`,
        data,
        {
            jobId,
            ...options,
        },
    )

    console.log(
        `[QUEUE] Added delivery job: ${job.id}, Event: ${data.eventId}`,
    );
    return job.id || jobId;
}


/**
 * Close all queue connections gracefully
 */
export async function closeQueues(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    if (deliveryQueue) {
        closePromises.push(deliveryQueue.close());
        deliveryQueue = null;
    }

    await Promise.all(closePromises);
    console.log("[QUEUE] All queues closed");
}

/**
 * Get queue statistics for monitoring
 */
export async function getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
}> {
    const queue =
        queueName === QUEUE_NAMES.DELIVERY_QUEUE
            ? getDeliveryQueue()
            : null;

    const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue?.getWaitingCount() || 0,
        queue?.getActiveCount() || 0,
        queue?.getCompletedCount() || 0,
        queue?.getFailedCount() || 0,
        queue?.getDelayedCount() || 0,
    ]);

    return { waiting, active, completed, failed, delayed };
}
