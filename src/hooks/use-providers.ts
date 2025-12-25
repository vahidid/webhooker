"use client";

import queryKeys from "@/lib/queryKeys";
import { providerService } from "@/services/provider.service";
import { useQuery } from "@tanstack/react-query";

/**
 * Query: Get all providers
 */
export const useProviders = () =>
	useQuery({
		queryKey: queryKeys.provider.all(),
		queryFn: () => providerService.getAllProviders(),
		staleTime: 1000 * 60 * 60, // 1 hour - providers rarely change
	});
