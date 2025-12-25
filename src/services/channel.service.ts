import apiClient from "@/lib/apiClient";
import {
	CreateChannelInput,
	UpdateChannelInput,
} from "@/lib/validations/channel";
import { ApiResponse } from "@/types/api";
import type { Channel, ChannelStatus, ChannelType } from "@/generated/prisma/client";
import { AxiosResponse } from "axios";

export interface ChannelWithRelations extends Channel {
	_count: {
		routes: number;
	};
}

export interface ChannelFilters {
	status?: ChannelStatus;
	type?: ChannelType;
}

export const channelService = {
	/**
	 * Get all channels with optional filters
	 */
	getAllChannels: async (filters?: ChannelFilters) => {
		const params = new URLSearchParams();
		if (filters?.status) params.append("status", filters.status);
		if (filters?.type) params.append("type", filters.type);

		const response: AxiosResponse<ApiResponse<ChannelWithRelations[]>> =
			await apiClient.get(`/api/channels?${params.toString()}`);
		return response.data;
	},

	/**
	 * Get channel by ID
	 */
	getChannelById: async (id: string) => {
		const response: AxiosResponse<ApiResponse<ChannelWithRelations>> =
			await apiClient.get(`/api/channels/${id}`);
		return response.data;
	},

	/**
	 * Create new channel
	 */
	createChannel: async (data: CreateChannelInput) => {
		const response: AxiosResponse<ApiResponse<Channel>> =
			await apiClient.post(`/api/channels`, data);
		return response.data;
	},

	/**
	 * Update channel
	 */
	updateChannel: async (id: string, data: UpdateChannelInput) => {
		const response: AxiosResponse<ApiResponse<Channel>> =
			await apiClient.patch(`/api/channels/${id}`, data);
		return response.data;
	},

	/**
	 * Delete channel
	 */
	deleteChannel: async (id: string) => {
		const response: AxiosResponse<ApiResponse<{ success: boolean }>> =
			await apiClient.delete(`/api/channels/${id}`);
		return response.data;
	},
};
