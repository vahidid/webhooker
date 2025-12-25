"use client";

/**
 * Query Key Factory
 * Centralized and type-safe query keys for React Query
 *
 * Usage:
 * - queryKeys.organization.all() - Get all organizations
 * - queryKeys.organization.detail(id) - Get specific organization
 * - queryKeys.organization.byOwner(userId) - Get organizations by owner
 */

export const queryKeys = {
	// Organization related queries
	organization: {
		all: () => ["organizations"] as const,
		lists: () => [...queryKeys.organization.all(), "list"] as const,
		list: (filters?: unknown) =>
			[...queryKeys.organization.lists(), { filters }] as const,
		details: () => [...queryKeys.organization.all(), "detail"] as const,
		detail: (id: number | string) =>
			[...queryKeys.organization.details(), id] as const,
		byOwner: (userId: string) =>
			[...queryKeys.organization.all(), "owner", userId] as const,
	},

	// Endpoint related queries
	endpoint: {
		all: () => ["endpoints"] as const,
		lists: () => [...queryKeys.endpoint.all(), "list"] as const,
		list: (filters?: unknown) =>
			[...queryKeys.endpoint.lists(), { filters }] as const,
		details: () => [...queryKeys.endpoint.all(), "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.endpoint.details(), id] as const,
	},

	// Channel related queries
	channel: {
		all: () => ["channels"] as const,
		lists: () => [...queryKeys.channel.all(), "list"] as const,
		list: (filters?: unknown) =>
			[...queryKeys.channel.lists(), { filters }] as const,
		details: () => [...queryKeys.channel.all(), "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.channel.details(), id] as const,
	},

	// Route related queries
	route: {
		all: () => ["routes"] as const,
		lists: () => [...queryKeys.route.all(), "list"] as const,
		list: (filters?: unknown) =>
			[...queryKeys.route.lists(), { filters }] as const,
		details: () => [...queryKeys.route.all(), "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.route.details(), id] as const,
	},

	// Event related queries
	event: {
		all: () => ["events"] as const,
		lists: () => [...queryKeys.event.all(), "list"] as const,
		list: (filters?: unknown) =>
			[...queryKeys.event.lists(), { filters }] as const,
		details: () => [...queryKeys.event.all(), "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.event.details(), id] as const,
	},

	// Provider related queries
	provider: {
		all: () => ["providers"] as const,
		lists: () => [...queryKeys.provider.all(), "list"] as const,
		details: () => [...queryKeys.provider.all(), "detail"] as const,
		detail: (id: string) =>
			[...queryKeys.provider.details(), id] as const,
	},
} as const;

export default queryKeys;
