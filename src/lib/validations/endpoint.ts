import { z } from "zod/v3";

export const createEndpointSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  description: z.string().max(500).optional(),
  secret: z.string().min(16, "Secret must be at least 16 characters"),
  providerId: z.string().min(1, "Provider is required"),
  allowedEvents: z.array(z.string()).optional().default([]),
});

export const updateEndpointSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    )
    .optional(),
  description: z.string().max(500).optional().nullable(),
  secret: z.string().min(16, "Secret must be at least 16 characters").optional(),
  status: z.enum(["ACTIVE", "PAUSED", "DISABLED"]).optional(),
  allowedEvents: z.array(z.string()).optional(),
});

export type CreateEndpointInput = z.infer<typeof createEndpointSchema>;
export type UpdateEndpointInput = z.infer<typeof updateEndpointSchema>;
