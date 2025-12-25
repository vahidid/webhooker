import { z } from "zod/v3";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  memberCount: z
    .number()
    .min(1, "Organization must have at least 1 member")
    .max(1000, "Member count cannot exceed 1000"),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationFormData = z.infer<typeof updateOrganizationSchema>;
