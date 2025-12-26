/**
 * Common types for provider webhook payload schemas
 * These types define the structure used across all provider definitions
 */

export interface PayloadField {
  path: string;
  label: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
}

/**
 * Provider payload schema definition
 * Maps event types to their payload field definitions
 */
export interface ProviderPayloadSchemas {
  /** Common fields present in all/most events for this provider */
  common: PayloadField[];
  /** Event-specific payload fields */
  events: Record<string, PayloadField[]>;
}

/**
 * Registry of all provider payload schemas
 * Key is the provider name (e.g., "gitlab", "github")
 */
export type ProviderRegistry = Record<string, ProviderPayloadSchemas>;
