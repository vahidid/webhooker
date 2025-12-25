import axios, { type AxiosError } from "axios";

import { ApiErrorResponse } from "@/types/api";
import { API_URL } from "@/utils/constants";


/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
	baseURL: typeof window !== "undefined" ? "" : API_URL,
	headers: {
		"Content-Type": "application/json",
	},
	// withCredentials: true, // Enable when using cookies
});

/**
 * Request Interceptor
 * Add authentication tokens or other headers here
 */
apiClient.interceptors.request.use(
	async (config) => {
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

/**
 * Response Interceptor
 * Handle common response errors and token refresh
 */
apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error: AxiosError<ApiErrorResponse>) => {
		// const originalConfig = error.config;

		// Handle 401 Unauthorized
		if (error.response?.status === 401) {
			// TODO: Implement token refresh logic
			// You can redirect to login or refresh token here
			console.error("Unauthorized - Please login again");
		}

		// Handle 403 Forbidden
		if (error.response?.status === 403) {
			console.error("Forbidden - You don't have permission");
		}

		// Handle 500 Server Error
		if (error.response?.status === 500) {
			console.error("Server Error - Please try again later");
		}

		return Promise.reject(error);
	},
);

export default apiClient;
