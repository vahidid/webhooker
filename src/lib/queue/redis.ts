import Redis from "ioredis";

/**
 * Redis connection configuration
 * Uses REDIS_URL environment variable for connection
 */
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Create a new Redis connection
 * Each BullMQ component (Queue, Worker) needs its own connection
 */
export function createRedisConnection(): Redis {
	const connection = new Redis(REDIS_URL, {
		maxRetriesPerRequest: null, // Required by BullMQ
		enableReadyCheck: false,
		retryStrategy: (times: number) => {
			if (times > 3) {
				console.error("[REDIS] Max retries reached, giving up");
				return null;
			}
			const delay = Math.min(times * 200, 2000);
			console.log(
				`[REDIS] Retrying connection in ${delay}ms (attempt ${times})`,
			);
			return delay;
		},
	});

	connection.on("error", (error) => {
		console.error("[REDIS_ERROR]", error.message);
	});

	connection.on("connect", () => {
		console.log("[REDIS] Connected successfully");
	});

	return connection;
}

/**
 * Shared Redis connection for read operations
 * Note: BullMQ recommends separate connections for Queue and Worker
 */
let sharedConnection: Redis | null = null;

export function getSharedRedisConnection(): Redis {
	if (!sharedConnection) {
		sharedConnection = createRedisConnection();
	}
	return sharedConnection;
}

/**
 * Check if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
	try {
		const connection = getSharedRedisConnection();
		await connection.ping();
		return true;
	} catch {
		return false;
	}
}

/**
 * Gracefully close Redis connections
 */
export async function closeRedisConnections(): Promise<void> {
	if (sharedConnection) {
		await sharedConnection.quit();
		sharedConnection = null;
	}
}
