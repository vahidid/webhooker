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
		list: (filters?: Record<string, unknown>) =>
			[...queryKeys.organization.lists(), { filters }] as const,
		details: () => [...queryKeys.organization.all(), "detail"] as const,
		detail: (id: number | string) =>
			[...queryKeys.organization.details(), id] as const,
		byOwner: (userId: string) =>
			[...queryKeys.organization.all(), "owner", userId] as const,
	},
} as const;

export default queryKeys;
