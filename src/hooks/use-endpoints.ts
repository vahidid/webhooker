"use client";

import queryKeys from "@/lib/queryKeys";
import {
	CreateEndpointInput,
	UpdateEndpointInput,
} from "@/lib/validations/endpoint";
import {
	endpointService,
	EndpointFilters,
} from "@/services/endpoint.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Query: Get all endpoints
 */
export const useEndpoints = (filters?: EndpointFilters) =>
	useQuery({
		queryKey: queryKeys.endpoint.list(filters),
		queryFn: () => endpointService.getAllEndpoints(filters),
	});

/**
 * Query: Get endpoint by ID
 */
export const useEndpoint = (id: string) =>
	useQuery({
		queryKey: queryKeys.endpoint.detail(id),
		queryFn: () => endpointService.getEndpointById(id),
		enabled: !!id,
	});

/**
 * Mutation: Create endpoint
 */
export const useCreateEndpoint = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateEndpointInput) =>
			endpointService.createEndpoint(data),
		onSuccess: () => {
			// Invalidate and refetch endpoints list
			queryClient.invalidateQueries({
				queryKey: queryKeys.endpoint.lists(),
			});
		},
	});
};

/**
 * Mutation: Update endpoint
 */
export const useUpdateEndpoint = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: UpdateEndpointInput;
		}) => endpointService.updateEndpoint(id, data),
		onSuccess: (_, variables) => {
			// Invalidate specific endpoint and lists
			queryClient.invalidateQueries({
				queryKey: queryKeys.endpoint.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.endpoint.lists(),
			});
		},
	});
};

/**
 * Mutation: Delete endpoint
 */
export const useDeleteEndpoint = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => endpointService.deleteEndpoint(id),
		onSuccess: () => {
			// Invalidate endpoints list
			queryClient.invalidateQueries({
				queryKey: queryKeys.endpoint.lists(),
			});
		},
	});
};
