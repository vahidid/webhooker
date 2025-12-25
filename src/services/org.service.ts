import apiClient from "@/lib/apiClient";
import { CreateOrganizationFormData } from "@/lib/validations/organization";
import { ApiResponse } from "@/types/api";
import { AxiosResponse } from "axios";



export const organizationService = {
    getOrganizationById: async (id: number) => {
        // Implementation for fetching organization by ID
    },
    getAllOrganizations: async () => {
        // Implementation for fetching all organizations
    },
    createOrganization: async (data: CreateOrganizationFormData) => {
        const response: AxiosResponse<ApiResponse<{success: boolean}>> =
			await apiClient.post(`/api/org`, data);
		return response.data;
    }
}