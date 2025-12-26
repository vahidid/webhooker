import Handlebars from "handlebars";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Template context type for message rendering
 */
export interface TemplateContext {
  headers: Record<string, string>;
  payload: Record<string, unknown>;
  eventType: string;
  endpoint?: {
    id: string;
    name: string;
    slug: string;
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Process a Handlebars template with the provided context
 * 
 * @param template - The Handlebars template string
 * @param context - The data to use for template rendering
 * @returns The rendered template as a string
 */
export function processTemplate(
  template: string,
  context: TemplateContext
): string {
  try {
    // Register custom helpers if needed
    registerHelpers();

    // Compile and execute the template
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(context);
  } catch (error) {
    console.error("Template processing error:", error);
    // Return a fallback message on error
    return `Template processing failed: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

/**
 * Process message content for a delivery based on route configuration
 * 
 * @param route - The route with template or messageContent
 * @param event - The event data
 * @param endpoint - Optional endpoint data
 * @param organization - Optional organization data
 * @returns The processed message content as a string
 */
export function processMessageContent(
  route: {
    messageContent: string | null;
    template?: {
      template: string;
      format: string;
    } | null;
  },
  event: {
    eventType: string;
    headers: Prisma.JsonValue;
    body: Prisma.JsonValue;
  },
  endpoint?: {
    id: string;
    name: string;
    slug: string;
  },
  organization?: {
    id: string;
    name: string;
    slug: string;
  }
): string {
  // Prepare template context
  const context: TemplateContext = {
    headers: event.headers as Record<string, string>,
    payload: event.body as Record<string, unknown>,
    eventType: event.eventType,
    endpoint,
    organization,
  };

  // Use route's template if exists, otherwise use route's messageContent
  let templateString: string;

  if (route.template?.template) {
    templateString = route.template.template;
  } else if (route.messageContent) {
    templateString = route.messageContent;
  } else {
    // Fallback: create a basic message with event type
    templateString = "New event: {{eventType}}";
  }

  return processTemplate(templateString, context);
}

/**
 * Register custom Handlebars helpers
 */
function registerHelpers(): void {
  // Helper: Format date/time
  if (!Handlebars.helpers.formatDate) {
    Handlebars.registerHelper("formatDate", function (date: string | Date) {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    });
  }

  // Helper: Truncate text
  if (!Handlebars.helpers.truncate) {
    Handlebars.registerHelper(
      "truncate",
      function (text: string, length: number) {
        if (!text || typeof text !== "string") return "";
        if (text.length <= length) return text;
        return text.substring(0, length) + "...";
      }
    );
  }

  // Helper: JSON stringify with pretty print
  if (!Handlebars.helpers.json) {
    Handlebars.registerHelper("json", function (obj: unknown) {
      return JSON.stringify(obj, null, 2);
    });
  }

  // Helper: Uppercase
  if (!Handlebars.helpers.uppercase) {
    Handlebars.registerHelper("uppercase", function (text: string) {
      if (!text || typeof text !== "string") return "";
      return text.toUpperCase();
    });
  }

  // Helper: Lowercase
  if (!Handlebars.helpers.lowercase) {
    Handlebars.registerHelper("lowercase", function (text: string) {
      if (!text || typeof text !== "string") return "";
      return text.toLowerCase();
    });
  }

  // Helper: Conditional equality
  if (!Handlebars.helpers.eq) {
    Handlebars.registerHelper("eq", function (a: unknown, b: unknown) {
      return a === b;
    });
  }

  // Helper: Safe property access
  if (!Handlebars.helpers.get) {
    Handlebars.registerHelper(
      "get",
      function (obj: Record<string, unknown>, path: string) {
        const keys = path.split(".");
        let result: unknown = obj;

        for (const key of keys) {
          if (
            result &&
            typeof result === "object" &&
            key in (result as Record<string, unknown>)
          ) {
            result = (result as Record<string, unknown>)[key];
          } else {
            return undefined;
          }
        }

        return result;
      }
    );
  }
}
