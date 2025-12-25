import { z } from "zod/v3";

// JSON-compatible value type for Prisma
const jsonValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValue),
    z.record(jsonValue),
  ])
);

export const channelTypeEnum = z.enum([
  "TELEGRAM",
  "SLACK",
  "DISCORD",
  "ROCKETCHAT",
  "MATTERMOST",
  "MICROSOFT_TEAMS",
  "WEBHOOK",
  "EMAIL",
]);

// Telegram-specific credentials
const telegramCredentialsSchema = z.object({
  botToken: z
    .string()
    .min(1, "Bot token is required")
    .regex(/^\d+:[A-Za-z0-9_-]+$/, "Invalid bot token format"),
});

// Telegram-specific config
const telegramConfigSchema = z.object({
  chatId: z
    .string()
    .min(1, "Chat ID is required")
    .regex(/^-?\d+$/, "Chat ID must be a number"),
  threadId: z.string().optional(),
});

// Generic webhook credentials
const webhookCredentialsSchema = z.object({
  url: z.string().url("Invalid webhook URL"),
  headers: z.record(z.string()).optional(),
});

export const createChannelSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  type: channelTypeEnum,
  credentials: z.union([
    telegramCredentialsSchema,
    webhookCredentialsSchema,
    z.record(z.string(), jsonValue),
  ]),
  config: z.record(z.string(), jsonValue).optional().default({}),
  maxDeliveryRate: z.number().int().positive().optional().nullable(),
});

export const updateChannelSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  credentials: z.record(z.string(), jsonValue).optional(),
  config: z.record(z.string(), jsonValue).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "DISABLED", "ERROR"]).optional(),
  maxDeliveryRate: z.number().int().positive().optional().nullable(),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
