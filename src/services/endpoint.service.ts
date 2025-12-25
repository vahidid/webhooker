import apiClient from "@/lib/apiClient";
import {
	CreateEndpointInput,
	UpdateEndpointInput,
} from "@/lib/validations/endpoint";
import { ApiResponse } from "@/types/api";
import type { Endpoint, EndpointStatus } from "@/generated/prisma/client";
import { AxiosResponse } from "axios";

export interface EndpointWithRelations extends Endpoint {
	provider: {
		id: string;
		name: string;
		displayName: string;
		iconUrl: string | null;
		eventTypes: string[] | unknown;
	};
	_count: {
		events: number;
		routes: number;
	};
}

export interface EndpointFilters {
	status?: EndpointStatus;
	providerId?: string;
}

export const endpointService = {
	/**
	 * Get all endpoints with optional filters
	 */
	getAllEndpoints: async (filters?: EndpointFilters) => {
		const params = new URLSearchParams();
		if (filters?.status) params.append("status", filters.status);
		if (filters?.providerId) params.append("providerId", filters.providerId);

		const response: AxiosResponse<ApiResponse<EndpointWithRelations[]>> =
			await apiClient.get(`/api/endpoints?${params.toString()}`);
		return response.data;
	},

	/**
	 * Get endpoint by ID
	 */
	getEndpointById: async (id: string) => {
		const response: AxiosResponse<ApiResponse<EndpointWithRelations>> =
			await apiClient.get(`/api/endpoints/${id}`);
		return response.data;
	},

	/**
	 * Create new endpoint
	 */
	createEndpoint: async (data: CreateEndpointInput) => {
		const response: AxiosResponse<ApiResponse<Endpoint>> =
			await apiClient.post(`/api/endpoints`, data);
		return response.data;
	},

	/**
	 * Update endpoint
	 */
	updateEndpoint: async (id: string, data: UpdateEndpointInput) => {
		const response: AxiosResponse<ApiResponse<Endpoint>> =
			await apiClient.patch(`/api/endpoints/${id}`, data);
		return response.data;
	},

	/**
	 * Delete endpoint
	 */
	deleteEndpoint: async (id: string) => {
		const response: AxiosResponse<ApiResponse<{ success: boolean }>> =
			await apiClient.delete(`/api/endpoints/${id}`);
		return response.data;
	},
};
