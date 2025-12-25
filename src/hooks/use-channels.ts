"use client";

import queryKeys from "@/lib/queryKeys";
import {
	CreateChannelInput,
	UpdateChannelInput,
} from "@/lib/validations/channel";
import {
	channelService,
	ChannelFilters,
} from "@/services/channel.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Query: Get all channels
 */
export const useChannels = (filters?: ChannelFilters) =>
	useQuery({
		queryKey: queryKeys.channel.list(filters),
		queryFn: () => channelService.getAllChannels(filters),
	});

/**
 * Query: Get channel by ID
 */
export const useChannel = (id: string) =>
	useQuery({
		queryKey: queryKeys.channel.detail(id),
		queryFn: () => channelService.getChannelById(id),
		enabled: !!id,
	});

/**
 * Mutation: Create channel
 */
export const useCreateChannel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateChannelInput) =>
			channelService.createChannel(data),
		onSuccess: () => {
			// Invalidate and refetch channels list
			queryClient.invalidateQueries({
				queryKey: queryKeys.channel.lists(),
			});
		},
	});
};

/**
 * Mutation: Update channel
 */
export const useUpdateChannel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: UpdateChannelInput;
		}) => channelService.updateChannel(id, data),
		onSuccess: (_, variables) => {
			// Invalidate specific channel and lists
			queryClient.invalidateQueries({
				queryKey: queryKeys.channel.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.channel.lists(),
			});
		},
	});
};

/**
 * Mutation: Delete channel
 */
export const useDeleteChannel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => channelService.deleteChannel(id),
		onSuccess: () => {
			// Invalidate channels list
			queryClient.invalidateQueries({
				queryKey: queryKeys.channel.lists(),
			});
		},
	});
};
