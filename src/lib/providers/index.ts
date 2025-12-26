/**
 * Provider Payload Registry
 * Central registry for all webhook provider payload schemas
 */

import type { ProviderRegistry, PayloadField } from "./types";
import { gitlabPayloadSchemas } from "./gitlab";
import { githubPayloadSchemas } from "./github";

/**
 * Registry of all provider payload schemas
 * Key is the provider name (must match Provider.name in database)
 */
export const providerRegistry: ProviderRegistry = {
  gitlab: gitlabPayloadSchemas,
  github: githubPayloadSchemas,
};

/**
 * Get payload schema for a specific provider
 */
export function getProviderSchema(providerName: string) {
  return providerRegistry[providerName];
}

/**
 * Get all payload fields for a provider's specific event types
 * Returns common fields if no event types specified
 */
export function getPayloadFieldsForProvider(
  providerName: string,
  eventTypes: string[] = []
): PayloadField[] {
  const schema = providerRegistry[providerName];
  if (!schema) {
    return [];
  }

  if (eventTypes.length === 0) {
    return schema.common;
  }

  const fieldsMap = new Map<string, PayloadField>();

  for (const eventType of eventTypes) {
    const fields = schema.events[eventType] || schema.common;
    for (const field of fields) {
      if (!fieldsMap.has(field.path)) {
        fieldsMap.set(field.path, field);
      }
    }
  }

  return Array.from(fieldsMap.values());
}

/**
 * Get autocomplete suggestions for a provider's events
 * Filters fields by partial path match and ranks by relevance
 */
export function getAutocompleteSuggestions(
  providerName: string,
  eventTypes: string[],
  partialPath: string
): PayloadField[] {
  const allFields = getPayloadFieldsForProvider(providerName, eventTypes);
  const lowerPartial = partialPath.toLowerCase();

  return allFields
    .filter(
      (field) =>
        field.path.toLowerCase().includes(lowerPartial) ||
        field.label.toLowerCase().includes(lowerPartial) ||
        field.description?.toLowerCase().includes(lowerPartial)
    )
    .sort((a, b) => {
      // Prioritize fields that start with the partial path
      const aStarts = a.path.toLowerCase().startsWith(lowerPartial);
      const bStarts = b.path.toLowerCase().startsWith(lowerPartial);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.path.localeCompare(b.path);
    })
    .slice(0, 20);
}

/**
 * Check if a provider has payload schema definitions
 */
export function hasProviderSchema(providerName: string): boolean {
  return providerName in providerRegistry;
}

/**
 * Get all available event types for a provider
 */
export function getProviderEventTypes(providerName: string): string[] {
  const schema = providerRegistry[providerName];
  if (!schema) {
    return [];
  }
  return Object.keys(schema.events);
}

// Re-export types for convenience
export type { PayloadField, ProviderPayloadSchemas, ProviderRegistry } from "./types";
