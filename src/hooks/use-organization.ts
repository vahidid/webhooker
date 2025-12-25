"use client"

/**
 * Query: Get all organizations
 */

import queryKeys from "@/lib/queryKeys";
import { CreateOrganizationFormData } from "@/lib/validations/organization";
import { organizationService } from "@/services/org.service";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useOrganizations = () => useQuery({
    queryKey: queryKeys.organization.all(),
    queryFn: () => organizationService.getAllOrganizations(),
});


export const useCreateOrganization = () => useMutation({
    mutationFn: (data: CreateOrganizationFormData) => organizationService.createOrganization(data),
});