#!/usr/bin/env tsx
/**
 * Notification Queue Worker
 *
 * This script runs the BullMQ workers that process notification jobs.
 * It should be run as a separate process alongside the Next.js application.
 *
 * Usage:
 *   pnpm worker:notifications
 *   # or
 *   tsx src/workers/notification-worker.ts
 *
 * Environment Variables:
 *   REDIS_URL - Redis connection URL (default: redis://localhost:6379)
 *   DATABASE_URL - PostgreSQL connection URL (required)
 *
 * Graceful Shutdown:
 *   The worker handles SIGTERM and SIGINT signals for graceful shutdown.
 *   Pending jobs will be completed before the worker exits.
 */

// Load environment variables before importing anything else
import "dotenv/config";

import {
	closeRedisConnections,
	startAllWorkers,
	stopAllWorkers,
} from "@/lib/queue";

console.log("=".repeat(60));
console.log("Delivery Queue Worker Starting...");
console.log("=".repeat(60));
console.log(`Redis URL: ${process.env.REDIS_URL || "redis://localhost:6379"}`);
console.log(
	`Database: ${process.env.DATABASE_URL ? "configured" : "NOT CONFIGURED!"}`,
);
console.log(`Time: ${new Date().toISOString()}`);
console.log("=".repeat(60));

// Start workers
startAllWorkers();

// Graceful shutdown handler
async function shutdown(signal: string): Promise<void> {
	console.log(`\n[WORKER] Received ${signal}, shutting down gracefully...`);

	try {
		await stopAllWorkers();
		await closeRedisConnections();
		console.log("[WORKER] Shutdown complete");
		process.exit(0);
	} catch (error) {
		console.error("[WORKER] Error during shutdown:", error);
		process.exit(1);
	}
}

// Handle termination signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
	console.error("[WORKER] Uncaught exception:", error);
	shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
	console.error("[WORKER] Unhandled rejection:", reason);
	shutdown("unhandledRejection");
});

console.log("[WORKER] Workers are running. Press Ctrl+C to stop.");
