"use client";

import queryKeys from "@/lib/queryKeys";
import {
	CreateRouteInput,
	UpdateRouteInput,
} from "@/lib/validations/route";
import { routeService, RouteFilters } from "@/services/route.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Query: Get all routes
 */
export const useRoutes = (filters?: RouteFilters) =>
	useQuery({
		queryKey: queryKeys.route.list(filters),
		queryFn: () => routeService.getAllRoutes(filters),
	});

/**
 * Query: Get route by ID
 */
export const useRoute = (id: string) =>
	useQuery({
		queryKey: queryKeys.route.detail(id),
		queryFn: () => routeService.getRouteById(id),
		enabled: !!id,
	});

/**
 * Mutation: Create route
 */
export const useCreateRoute = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRouteInput) =>
			routeService.createRoute(data),
		onSuccess: () => {
			// Invalidate and refetch routes list
			queryClient.invalidateQueries({
				queryKey: queryKeys.route.lists(),
			});
		},
	});
};

/**
 * Mutation: Update route
 */
export const useUpdateRoute = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: UpdateRouteInput;
		}) => routeService.updateRoute(id, data),
		onSuccess: (_, variables) => {
			// Invalidate specific route and lists
			queryClient.invalidateQueries({
				queryKey: queryKeys.route.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.route.lists(),
			});
		},
	});
};

/**
 * Mutation: Delete route
 */
export const useDeleteRoute = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => routeService.deleteRoute(id),
		onSuccess: () => {
			// Invalidate routes list
			queryClient.invalidateQueries({
				queryKey: queryKeys.route.lists(),
			});
		},
	});
};
