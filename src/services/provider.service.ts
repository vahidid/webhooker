import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/api";
import type { Provider } from "@/generated/prisma/client";
import { AxiosResponse } from "axios";

export const providerService = {
	/**
	 * Get all providers (public endpoint)
	 */
	getAllProviders: async () => {
		const response: AxiosResponse<ApiResponse<Provider[]>> =
			await apiClient.get(`/api/providers`);
		return response.data;
	},
};
