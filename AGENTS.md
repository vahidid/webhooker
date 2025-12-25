# Webhooker - Agent Instructions

This document describes the data model architecture and webhook notification flow for the Webhooker platform.

## Overview

Webhooker connects source applications (GitHub, GitLab, Jira, etc.) to messaging platforms (Telegram, Slack, Discord, etc.) via webhooks.

## Data Model Architecture

The schema is organized into three layers:

### Configuration Layer

| Model | Purpose |
|-------|---------|
| `Provider` | Source app types (GitHub, GitLab, Jira) - system-wide reference data |
| `Endpoint` | Webhook URL receiving events from a provider |
| `Channel` | Messaging destination (Telegram, Slack, etc.) |
| `Route` | Connection between Endpoint → Channel with filtering/retry rules |
| `MessageTemplate` | Transformation logic for formatting messages |

### Execution Layer

| Model | Purpose |
|-------|---------|
| `Event` | Raw incoming webhook payload |
| `Delivery` | Event routed through a specific route (fan-out support) |
| `Attempt` | Individual delivery attempt with full audit trail |

### Entity Relationships

```
Organization
    ├── Endpoint (receives webhooks)
    │       │
    │       └── Event (incoming payload)
    │               │
    │               └── Delivery (per matching route)
    │                       │
    │                       └── Attempt (each retry)
    │
    ├── Channel (messaging destination)
    │
    ├── Route (Endpoint → Channel + rules)
    │       └── MessageTemplate (optional)
    │
    └── MessageTemplate (reusable transforms)
```

---

## Adding a New Provider

Providers are system-wide reference data. Add via seed script or admin panel:

```typescript
// Add to prisma/seed.ts or via admin API
await prisma.provider.create({
  data: {
    name: "notion",
    displayName: "Notion",
    description: "Notion webhooks for page and database updates",
    iconUrl: "/providers/notion.svg",
    signatureHeader: "X-Notion-Signature",
    signatureAlgo: "HMAC_SHA256",
    eventTypes: ["page.created", "page.updated", "database.updated"],
    docsUrl: "https://developers.notion.com/docs/webhooks",
  },
});
```

### Provider Fields

| Field | Description |
|-------|-------------|
| `name` | Unique identifier (lowercase, e.g., "github") |
| `displayName` | Human-readable name (e.g., "GitHub") |
| `signatureHeader` | HTTP header containing webhook signature |
| `signatureAlgo` | Algorithm: `HMAC_SHA1`, `HMAC_SHA256`, `HMAC_SHA512`, `NONE` |
| `eventTypes` | Array of supported event types |

---

## User Setup Flow

### Step 1: Create Endpoint

```typescript
const endpoint = await prisma.endpoint.create({
  data: {
    name: "My GitHub Repo",
    slug: "my-github-repo",
    organizationId: org.id,
    providerId: githubProvider.id,
    secret: generateSecret(), // For HMAC signature verification
  },
});

// Returns webhook URL:
// https://webhooker.app/api/webhook/{org.slug}/{endpoint.slug}
```

### Step 2: Create Channel

```typescript
const channel = await prisma.channel.create({
  data: {
    name: "Dev Team Telegram",
    type: "TELEGRAM",
    organizationId: org.id,
    credentials: encrypt({ botToken: "123:ABC..." }),
    config: { chatId: "-100123456789" },
  },
});
```

### Channel Types & Required Config

| Type | Credentials | Config |
|------|-------------|--------|
| `TELEGRAM` | `{ botToken }` | `{ chatId, threadId? }` |
| `SLACK` | `{ webhookUrl }` | `{ channel? }` |
| `DISCORD` | `{ webhookUrl }` | `{ username?, avatarUrl? }` |
| `ROCKETCHAT` | `{ webhookUrl }` | `{ channel? }` |
| `MATTERMOST` | `{ webhookUrl }` | `{ channel? }` |
| `MICROSOFT_TEAMS` | `{ webhookUrl }` | `{}` |
| `WEBHOOK` | `{ url, headers? }` | `{ method? }` |
| `EMAIL` | `{ smtpConfig }` | `{ to, subject? }` |

### Step 3: Create Route

```typescript
const route = await prisma.route.create({
  data: {
    name: "PRs to Telegram",
    organizationId: org.id,
    endpointId: endpoint.id,
    channelId: channel.id,
    filterExpression: "$.action == 'opened'", // Optional JSONPath filter
    templateId: template.id, // Optional message template
    retryStrategy: "EXPONENTIAL",
    retryCount: 5,
  },
});
```

### Step 4: Create Message Template (Optional)

```typescript
const template = await prisma.messageTemplate.create({
  data: {
    name: "PR Notification",
    organizationId: org.id,
    format: "MARKDOWN",
    template: `
**{{payload.action}}** PR in {{payload.repository.name}}

[{{payload.pull_request.title}}]({{payload.pull_request.html_url}})

By: {{payload.pull_request.user.login}}
    `.trim(),
  },
});
```

---

## Runtime Webhook Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           RUNTIME FLOW                                   │
└─────────────────────────────────────────────────────────────────────────┘

  Source app sends POST to:
  https://webhooker.app/api/webhook/{org-slug}/{endpoint-slug}
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  1. RECEIVE & VALIDATE                                                   │
│  ─────────────────────                                                   │
│  • Look up Endpoint by org slug + endpoint slug                          │
│  • Get Provider → check signatureHeader & signatureAlgo                  │
│  • Verify signature using endpoint.secret                                │
│  • Create Event record with status: RECEIVED                             │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  2. ROUTE MATCHING                                                       │
│  ─────────────────                                                       │
│  • Find all Routes where endpointId matches                              │
│  • Filter by status = ACTIVE                                             │
│  • Apply filterExpression to event payload                               │
│  • Create Delivery for each matching route                               │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
   │ Delivery #1     │    │ Delivery #2     │    │ Delivery #3     │
   │ → Telegram      │    │ → Slack         │    │ → Discord       │
   │ status: PENDING │    │ status: PENDING │    │ status: PENDING │
   └─────────────────┘    └─────────────────┘    └─────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  3. TRANSFORM (if template exists)                                       │
│  ─────────────────────────────────                                       │
│  • Load MessageTemplate                                                  │
│  • Apply Handlebars template to event.body                               │
│  • Store result in delivery.transformedBody                              │
│                                                                          │
│  Template: "🔀 PR {{payload.action}}: {{payload.pull_request.title}}"    │
│  Output:   "🔀 PR opened: Fix login bug"                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  4. DELIVER (Queue Worker)                                               │
│  ─────────────────────────                                               │
│  • Pick up PENDING deliveries                                            │
│  • Create Attempt with trigger: INITIAL                                  │
│  • Send to Channel based on type:                                        │
│    - TELEGRAM: Call Telegram Bot API                                     │
│    - SLACK: Call Slack Webhook URL                                       │
│    - DISCORD: Call Discord Webhook                                       │
│  • Record response in Attempt                                            │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
           ┌───────────────┐               ┌───────────────┐
           │   SUCCESS     │               │    FAILED     │
           │               │               │               │
           │ Attempt:      │               │ Attempt:      │
           │  status: OK   │               │  status: FAIL │
           │  response:200 │               │  error: 429   │
           │               │               │               │
           │ Delivery:     │               │ Schedule      │
           │  SUCCESSFUL   │               │ retry based   │
           └───────────────┘               │ on strategy   │
                                           └───────────────┘
                                                   │
                                                   ▼
                                    ┌───────────────────────────┐
                                    │  RETRY (if attempts left) │
                                    │  ─────────────────────────│
                                    │  EXPONENTIAL:             │
                                    │   1min → 2min → 4min →... │
                                    │                           │
                                    │  Create new Attempt with  │
                                    │  trigger: AUTOMATIC_RETRY │
                                    └───────────────────────────┘
```

---

## Complete Setup Example

```typescript
// User wants: GitHub PRs → Telegram + Slack

// 1. Create endpoint for GitHub
const endpoint = await prisma.endpoint.create({
  data: {
    name: "Main Repo Webhooks",
    slug: "main-repo",
    organizationId: org.id,
    providerId: githubProvider.id,
    secret: generateSecret(),
  },
});

// 2. Create Telegram channel
const telegramChannel = await prisma.channel.create({
  data: {
    name: "Dev Team Telegram",
    type: "TELEGRAM",
    organizationId: org.id,
    credentials: encrypt({ botToken: "123:ABC..." }),
    config: { chatId: "-100123456789" },
  },
});

// 3. Create Slack channel
const slackChannel = await prisma.channel.create({
  data: {
    name: "Dev Team Slack",
    type: "SLACK",
    organizationId: org.id,
    credentials: encrypt({ webhookUrl: "https://hooks.slack.com/..." }),
    config: { channel: "#dev-notifications" },
  },
});

// 4. Create message template
const template = await prisma.messageTemplate.create({
  data: {
    name: "PR Notification",
    organizationId: org.id,
    format: "MARKDOWN",
    template: `
**{{payload.action}}** PR in {{payload.repository.name}}

[{{payload.pull_request.title}}]({{payload.pull_request.html_url}})

By: {{payload.pull_request.user.login}}
    `.trim(),
  },
});

// 5. Create routes (endpoint → channels)
await prisma.route.createMany({
  data: [
    {
      name: "PRs to Telegram",
      organizationId: org.id,
      endpointId: endpoint.id,
      channelId: telegramChannel.id,
      templateId: template.id,
      filterExpression: "$.headers['x-github-event'] == 'pull_request'",
    },
    {
      name: "PRs to Slack",
      organizationId: org.id,
      endpointId: endpoint.id,
      channelId: slackChannel.id,
      templateId: template.id,
      filterExpression: "$.headers['x-github-event'] == 'pull_request'",
    },
  ],
});

// Webhook URL to configure in GitHub:
// https://webhooker.app/api/webhook/{org.slug}/{endpoint.slug}
```

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| **1 Endpoint : Many Routes** | Fan-out to multiple channels |
| **1 Event : Many Deliveries** | Each matching route creates a delivery |
| **1 Delivery : Many Attempts** | Retries create new attempts |
| **Templates are optional** | Routes can pass-through raw payload |
| **Filters are optional** | No filter = all events match |

---

## Status Enums

### EndpointStatus
- `ACTIVE` - Receiving webhooks
- `PAUSED` - Temporarily stopped
- `DISABLED` - Permanently disabled

### ChannelStatus
- `ACTIVE` - Ready to receive deliveries
- `PAUSED` - Temporarily stopped
- `DISABLED` - Permanently disabled
- `ERROR` - Credentials invalid

### RouteStatus
- `ACTIVE` - Processing events
- `PAUSED` - Holding deliveries
- `DISABLED` - Not processing

### EventStatus
- `RECEIVED` - Just received
- `PROCESSING` - Being routed
- `PROCESSED` - Successfully routed
- `IGNORED` - Filtered out
- `INVALID` - Signature failed
- `ERROR` - Processing failed

### DeliveryStatus
- `PENDING` - Waiting to be sent
- `SCHEDULED` - Scheduled for future
- `IN_PROGRESS` - Currently sending
- `SUCCESSFUL` - Delivered successfully
- `FAILED` - All retries exhausted
- `CANCELLED` - Manually cancelled
- `ON_HOLD` - Route is paused

### AttemptStatus
- `PENDING` - Waiting
- `IN_PROGRESS` - Sending
- `SUCCESSFUL` - 2xx response
- `FAILED` - Non-2xx response
- `TIMEOUT` - Request timed out
- `CANCELLED` - Cancelled

### AttemptTrigger
- `INITIAL` - First attempt
- `AUTOMATIC_RETRY` - Scheduled retry
- `MANUAL_RETRY` - User triggered
- `BULK_RETRY` - Bulk operation
- `UNPAUSE` - Route unpaused

---

## Retry Strategies

| Strategy | Behavior |
|----------|----------|
| `NONE` | No retries |
| `LINEAR` | Fixed interval (e.g., every 60s) |
| `EXPONENTIAL` | 1min → 2min → 4min → 8min → 16min |

---

## API Endpoints to Implement

### Webhook Receiver
```
POST /api/webhook/[orgSlug]/[endpointSlug]
```

### Management APIs
```
GET/POST   /api/endpoints
GET/PATCH  /api/endpoints/[id]

GET/POST   /api/channels
GET/PATCH  /api/channels/[id]

GET/POST   /api/routes
GET/PATCH  /api/routes/[id]

GET/POST   /api/templates
GET/PATCH  /api/templates/[id]

GET        /api/events
GET        /api/events/[id]
GET        /api/events/[id]/deliveries

GET        /api/deliveries/[id]
POST       /api/deliveries/[id]/retry
GET        /api/deliveries/[id]/attempts
```

---

## Validation Structure

The project uses Zod for validation. The validation schemas are located in the `src/lib/validations/` directory. Each schema corresponds to the data models and ensures that incoming data adheres to the expected formats.

## Service Implementation

Services must be implemented in the `src/services/` directory. For understanding the React Query hooks implementations, refer to the hooks defined in the same directory. These hooks wrap the service calls and manage the data fetching and caching logic effectively.

---

## Project Structure & Conventions

This project uses a feature-based directory structure on top of Next.js App Router. The goal is to keep UI, hooks, services, validations, and API routes organized by domain while sharing common utilities.

### Directory Layout (key paths)

```
src/
  app/
    api/                     # Backend route handlers per resource
      channels/
        [id]/
        route.ts
      endpoints/
        [id]/
        route.ts
      events/
        [id]/
        route.ts
      routes/
        [id]/
        route.ts
      auth/
      org/
      providers/

    dashboard/               # Feature pages (App Router)
      channels/
        page.tsx
        new/
          page.tsx
      endpoints/
        page.tsx
        new/
          page.tsx
      routes/
        page.tsx
        new/
          page.tsx
      events/
        page.tsx
        [id]/
          page.tsx
      layout.tsx             # Dashboard layout

    auth/                    # Auth pages (sign-in/up)
    onboarding/              # Onboarding flow pages
    globals.css              # Global styles
    layout.tsx               # Root layout (includes React Query provider + Toaster)

  components/
    ui/                      # Reusable UI primitives
      button.tsx, card.tsx, input.tsx, ...
      skeleton.tsx
    providers/
      query-client/
        index.tsx            # React Query client/provider setup
    dashboard/               # (Optional) dashboard-specific components
    organization/            # (Optional) organization components

  features/                  # Feature-scoped UI pieces
    channels/
      list-skeleton/
        index.tsx            # Channels list skeleton
    endpoints/
      list-skeleton/
        index.tsx            # Endpoints list skeleton

  hooks/                     # React Query hooks per resource
    use-channels.ts
    use-endpoints.ts
    use-events.ts
    use-routes.ts
    use-providers.ts
    use-organization.ts

  services/                  # Axios service clients per resource
    channel.service.ts
    endpoint.service.ts
    event.service.ts
    route.service.ts
    provider.service.ts
    org.service.ts

  lib/                       # Shared library code
    apiClient.ts             # Axios instance + interceptors
    queryKeys.ts             # Centralized React Query keys
    validations/             # Zod schemas (Create/Update inputs)
      channel.ts
      endpoint.ts
      route.ts
      organization.ts
    prisma.ts                # Prisma client
    auth.ts                  # Auth helpers
    actions/                 # Server actions (if any)
    errors.ts                # Query client error routing
    utils.ts                 # Generic utilities

  types/
    api.ts                   # ApiResponse, helpers, auth context
    next-auth.d.ts           # NextAuth TS declarations

  generated/
    prisma/                  # Prisma generated types (custom path)
      client.ts
      models.ts
      enums.ts

  utils/
    constants.ts             # Global constants
```

### Conventions

- Pages: App Router under `src/app/...` organized by feature (e.g., `dashboard/endpoints`, `dashboard/channels`).
- API Routes: One folder per resource under `src/app/api/<resource>`, with `[id]` sub-routes for item operations.
- Services: One file per resource in `src/services/` named `<resource>.service.ts`, using `apiClient`.
- Hooks: One file per resource in `src/hooks/` named `use-<resource>.ts`, wrapping services with React Query.
- Query Keys: Centralized factory in `src/lib/queryKeys.ts` using `queryKeys.<resource>.<list|detail>()`.
- Validations: Zod schemas in `src/lib/validations/` exporting `Create<Resource>Input` and `Update<Resource>Input`.
- Types: Shared API helpers and response types in `src/types/api.ts` (e.g., `ApiSuccessResponse<T>`, `cursorPaginatedResponse()`).
- UI: Reusable primitives in `src/components/ui/`; feature-specific UI in `src/features/<feature>/...`.
- React Query Provider: `src/components/providers/query-client/index.tsx` with caches and error routing.
- Prisma Types: Import from `@/generated/prisma/client` (custom generated path).

### Adding a New Feature

1. Create pages under `src/app/dashboard/<feature>/` (list, detail, new).
2. Add API routes under `src/app/api/<feature>/` (`route.ts`, `[id]/route.ts`).
3. Define Zod schemas in `src/lib/validations/<feature>.ts` (`Create/Update` inputs).
4. Implement `src/services/<feature>.service.ts` using `apiClient`.
5. Add hooks in `src/hooks/use-<feature>.ts` with query keys and cache invalidation.
6. Add query keys in `src/lib/queryKeys.ts` (`queryKeys.<feature>.list/detail`).
7. Create any feature-specific UI in `src/features/<feature>/` (e.g., skeletons, widgets).
8. Wire pages to hooks and show loading, empty, error states with toasts.

This structure keeps domain logic cohesive while promoting reuse of primitives, types, and helpers.
