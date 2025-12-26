import { z } from "zod/v3";

export const createRouteSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  endpointId: z.string().min(1, "Endpoint is required"),
  channelId: z.string().min(1, "Channel is required"),
  eventType: z.string().min(1, "Event type is required"),
  filterExpression: z.string().max(1000).optional(),
  messageContent: z.string().max(10000).optional().nullable(),
  delaySeconds: z.number().int().min(0).max(3600).optional().default(0),
  retryStrategy: z.enum(["NONE", "LINEAR", "EXPONENTIAL"]).optional().default("EXPONENTIAL"),
  retryCount: z.number().int().min(0).max(10).optional().default(5),
  retryIntervalMs: z.number().int().min(1000).max(3600000).optional().default(60000),
  priority: z.number().int().min(0).max(100).optional().default(0),
  templateId: z.string().optional().nullable(),
});

export const updateRouteSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  eventType: z.string().min(1).optional(),
  filterExpression: z.string().max(1000).optional().nullable(),
  messageContent: z.string().max(10000).optional().nullable(),
  delaySeconds: z.number().int().min(0).max(3600).optional(),
  retryStrategy: z.enum(["NONE", "LINEAR", "EXPONENTIAL"]).optional(),
  retryCount: z.number().int().min(0).max(10).optional(),
  retryIntervalMs: z.number().int().min(1000).max(3600000).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "DISABLED"]).optional(),
  templateId: z.string().optional().nullable(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
