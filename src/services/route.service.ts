import apiClient from "@/lib/apiClient";
import {
	CreateRouteInput,
	UpdateRouteInput,
} from "@/lib/validations/route";
import { ApiResponse } from "@/types/api";
import type { Route, RouteStatus } from "@/generated/prisma/client";
import { AxiosResponse } from "axios";

export interface RouteWithRelations extends Route {
	endpoint: {
		id: string;
		name: string;
		slug: string;
		provider: {
			id: string;
			name: string;
			displayName: string;
			iconUrl: string | null;
		};
	};
	channel: {
		id: string;
		name: string;
		type: string;
	};
	template: {
		id: string;
		name: string;
	} | null;
	_count: {
		deliveries: number;
	};
}

export interface RouteFilters {
	status?: RouteStatus;
	endpointId?: string;
	channelId?: string;
}

export const routeService = {
	/**
	 * Get all routes with optional filters
	 */
	getAllRoutes: async (filters?: RouteFilters) => {
		const params = new URLSearchParams();
		if (filters?.status) params.append("status", filters.status);
		if (filters?.endpointId) params.append("endpointId", filters.endpointId);
		if (filters?.channelId) params.append("channelId", filters.channelId);

		const response: AxiosResponse<ApiResponse<RouteWithRelations[]>> =
			await apiClient.get(`/api/routes?${params.toString()}`);
		return response.data;
	},

	/**
	 * Get route by ID
	 */
	getRouteById: async (id: string) => {
		const response: AxiosResponse<ApiResponse<RouteWithRelations>> =
			await apiClient.get(`/api/routes/${id}`);
		return response.data;
	},

	/**
	 * Create new route
	 */
	createRoute: async (data: CreateRouteInput) => {
		const response: AxiosResponse<ApiResponse<Route>> =
			await apiClient.post(`/api/routes`, data);
		return response.data;
	},

	/**
	 * Update route
	 */
	updateRoute: async (id: string, data: UpdateRouteInput) => {
		const response: AxiosResponse<ApiResponse<Route>> =
			await apiClient.patch(`/api/routes/${id}`, data);
		return response.data;
	},

	/**
	 * Delete route
	 */
	deleteRoute: async (id: string) => {
		const response: AxiosResponse<ApiResponse<{ success: boolean }>> =
			await apiClient.delete(`/api/routes/${id}`);
		return response.data;
	},
};
