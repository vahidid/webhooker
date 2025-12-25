import apiClient from "@/lib/apiClient";
import { ApiResponse, CursorPaginatedResponse } from "@/types/api";
import type { Event, EventStatus } from "@/generated/prisma/client";
import { AxiosResponse } from "axios";

export interface EventWithRelations extends Event {
	endpoint: {
		id: string;
		name: string;
		slug: string;
	};
	_count: {
		deliveries: number;
	};
}

export interface EventDetail extends EventWithRelations {
	deliveries: {
		id: string;
		status: string;
		createdAt: Date;
		route: {
			id: string;
			name: string;
			channel: {
				id: string;
				name: string;
				type: string;
			};
		};
		_count: {
			attempts: number;
		};
	}[];
}

export interface EventFilters {
	status?: EventStatus;
	endpointId?: string;
	cursor?: string;
	limit?: number;
}

export const eventService = {
	/**
	 * Get all events with cursor pagination
	 */
	getAllEvents: async (filters?: EventFilters) => {
		const params = new URLSearchParams();
		if (filters?.status) params.append("status", filters.status);
		if (filters?.endpointId) params.append("endpointId", filters.endpointId);
		if (filters?.cursor) params.append("cursor", filters.cursor);
		if (filters?.limit) params.append("limit", filters.limit.toString());

		const response: AxiosResponse<
			ApiResponse<CursorPaginatedResponse<EventWithRelations>>
		> = await apiClient.get(`/api/events?${params.toString()}`);
		return response.data;
	},

	/**
	 * Get event by ID with deliveries
	 */
	getEventById: async (id: string) => {
		const response: AxiosResponse<ApiResponse<EventDetail>> =
			await apiClient.get(`/api/events/${id}`);
		return response.data;
	},
};
