"use client";

import queryKeys from "@/lib/queryKeys";
import { eventService, EventFilters } from "@/services/event.service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

/**
 * Infinite Query: Get all events with cursor pagination
 */
export const useEvents = (filters?: Omit<EventFilters, "cursor">) =>
	useInfiniteQuery({
		queryKey: queryKeys.event.list(filters),
		queryFn: ({ pageParam = undefined }: { pageParam?: string }) =>
			eventService.getAllEvents({
				...filters,
				cursor: pageParam,
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => {
			if (!lastPage.success) return undefined;
			return lastPage.data.nextCursor ?? undefined;
		},
	});

/**
 * Query: Get event by ID with deliveries
 */
export const useEvent = (id: string) =>
	useQuery({
		queryKey: queryKeys.event.detail(id),
		queryFn: () => eventService.getEventById(id),
		enabled: !!id,
	});
