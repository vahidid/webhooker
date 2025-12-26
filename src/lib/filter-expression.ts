import { JSONPath } from "jsonpath-plus";

/**
 * Evaluate a filter expression against event data
 * 
 * Filter expressions use JSONPath syntax to query the event payload.
 * Examples:
 * - "$.body.action == 'opened'"
 * - "$.headers['x-github-event'] == 'pull_request'"
 * - "$.body.pull_request.base.ref == 'main'"
 * 
 * @param expression - JSONPath filter expression
 * @param data - Event data (headers, body, eventType)
 * @returns true if the filter matches, false otherwise
 */
export function evaluateFilter(
  expression: string,
  data: {
    headers: Record<string, string>;
    body: Record<string, unknown>;
    eventType: string;
  }
): boolean {
  if (!expression || expression.trim() === "") {
    return true; // Empty filter matches everything
  }

  try {
    // Create a context object with all event data
    const context = {
      headers: data.headers,
      body: data.body,
      payload: data.body, // Alias for convenience
      eventType: data.eventType,
    };

    // Simple equality check: $.path == 'value'
    const equalityMatch = expression.match(/^\$\.(.+?)\s*==\s*['"](.+?)['"]$/);
    if (equalityMatch) {
      const [, path, expectedValue] = equalityMatch;
      const result = JSONPath({ path: `$.${path}`, json: context });
      return result.length > 0 && result[0] === expectedValue;
    }

    // Simple inequality check: $.path != 'value'
    const inequalityMatch = expression.match(/^\$\.(.+?)\s*!=\s*['"](.+?)['"]$/);
    if (inequalityMatch) {
      const [, path, expectedValue] = inequalityMatch;
      const result = JSONPath({ path: `$.${path}`, json: context });
      return result.length === 0 || result[0] !== expectedValue;
    }

    // Contains check: $.path contains 'value'
    const containsMatch = expression.match(/^\$\.(.+?)\s+contains\s+['"](.+?)['"]$/);
    if (containsMatch) {
      const [, path, searchValue] = containsMatch;
      const result = JSONPath({ path: `$.${path}`, json: context });
      if (result.length === 0) return false;
      const value = result[0];
      if (typeof value === "string") {
        return value.includes(searchValue);
      }
      if (Array.isArray(value)) {
        return value.includes(searchValue);
      }
      return false;
    }

    // Exists check: $.path exists
    const existsMatch = expression.match(/^\$\.(.+?)\s+exists$/);
    if (existsMatch) {
      const [, path] = existsMatch;
      const result = JSONPath({ path: `$.${path}`, json: context });
      return result.length > 0;
    }

    // AND operator: expression1 && expression2
    if (expression.includes(" && ")) {
      const parts = expression.split(" && ");
      return parts.every((part) => evaluateFilter(part.trim(), data));
    }

    // OR operator: expression1 || expression2
    if (expression.includes(" || ")) {
      const parts = expression.split(" || ");
      return parts.some((part) => evaluateFilter(part.trim(), data));
    }

    // If no pattern matches, try to evaluate as JSONPath directly
    // Return true if any result is found
    const result = JSONPath({ path: expression, json: context });
    return result.length > 0;
  } catch (error) {
    console.error("Filter evaluation error:", error);
    // On error, default to not matching
    return false;
  }
}
