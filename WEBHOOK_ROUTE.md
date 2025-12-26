# Webhook Route Implementation

This document describes the webhook route implementation for receiving events from external providers (GitLab, GitHub, Jira, etc.).

## Endpoint URL Structure

```
POST https://webhooker.app/api/webhook/{orgSlug}/{endpointSlug}
```

- `{orgSlug}` - Organization slug identifier
- `{endpointSlug}` - Endpoint slug identifier

## Processing Flow

### 1. Receive & Validate

The webhook handler performs the following validation steps:

1. **Lookup Endpoint**: Finds the endpoint by organization slug and endpoint slug
2. **Check Status**: Ensures the endpoint is `ACTIVE`
3. **Extract Event Type**: Determines event type based on provider (e.g., `x-github-event` header)
4. **Filter Allowed Events**: Checks if event type is in the endpoint's `allowedEvents` list (if configured)
5. **Verify Signature**: Validates webhook signature using the provider's algorithm:
   - `HMAC_SHA1` - GitHub (legacy)
   - `HMAC_SHA256` - GitHub, GitLab
   - `HMAC_SHA512` - Custom providers
   - `NONE` - No verification (development only)
6. **Create Event Record**: Stores the event with status `RECEIVED`

### 2. Route Matching

After validation, the handler matches the event to active routes:

1. **Find Active Routes**: Queries routes connected to the endpoint with `ACTIVE` status
2. **Match Event Type**: Filters routes where `eventType` matches or is wildcard (`*` or empty)
3. **Apply Filter Expressions**: Evaluates JSONPath filter expressions on each route
4. **Collect Matched Routes**: Builds list of routes that passed all filters

### 3. Create Deliveries

For each matched route:

1. **Check Channel Status**: Ensures the target channel is `ACTIVE`
2. **Calculate Scheduled Time**: Adds delay if `delaySeconds` is configured on the route
3. **Create Delivery Record**: 
   - Status: `SCHEDULED` (if delayed) or `PENDING`
   - Includes retry configuration from route settings
4. **Create Initial Attempt**: Records the first delivery attempt with `INITIAL` trigger

### Event Status Transitions

```
RECEIVED → PROCESSING → PROCESSED (success)
                      → IGNORED (no matching routes or filtered out)
                      
RECEIVED → INVALID (signature verification failed)
```

## Filter Expressions

Filter expressions use JSONPath syntax to query event data:

### Simple Equality
```
$.body.action == 'opened'
$.headers['x-github-event'] == 'pull_request'
```

### Inequality
```
$.body.state != 'closed'
```

### Contains
```
$.body.labels contains 'bug'
```

### Exists
```
$.body.pull_request exists
```

### Logical Operators
```
$.body.action == 'opened' && $.body.pull_request.base.ref == 'main'
$.eventType == 'push' || $.eventType == 'merge_request'
```

## Signature Verification

The webhook handler supports multiple signature algorithms:

### GitHub
- Header: `X-Hub-Signature-256`
- Format: `sha256=<hex_signature>`
- Algorithm: `HMAC_SHA256`

### GitLab
- Header: `X-Gitlab-Token`
- Format: `<hex_signature>`
- Algorithm: `HMAC_SHA256`

### Custom
Configure in the Provider model:
- `signatureHeader` - HTTP header name
- `signatureAlgo` - Algorithm enum value
- Secret stored in `endpoint.secret`

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Event received and processed successfully |
| 400 | Invalid JSON payload |
| 401 | Invalid signature |
| 404 | Endpoint not found or inactive |
| 500 | Internal server error |

## Example Webhook Payload (GitHub Pull Request)

```json
{
  "action": "opened",
  "number": 42,
  "pull_request": {
    "title": "Fix login bug",
    "user": {
      "login": "johndoe"
    },
    "base": {
      "ref": "main"
    },
    "html_url": "https://github.com/org/repo/pull/42"
  },
  "repository": {
    "name": "my-repo",
    "full_name": "org/my-repo"
  }
}
```

## Testing Locally

### 1. Use ngrok to expose local server
```bash
ngrok http 3000
```

### 2. Configure webhook in provider
Use the ngrok URL:
```
https://abc123.ngrok.io/api/webhook/{orgSlug}/{endpointSlug}
```

### 3. Set endpoint secret
Match the secret configured in the provider's webhook settings.

## Files

- [/Users/vahid/Workspace/Personal/webhooker/src/app/api/webhook/[orgSlug]/[endpointSlug]/route.ts](../src/app/api/webhook/[orgSlug]/[endpointSlug]/route.ts) - Main webhook handler
- [/Users/vahid/Workspace/Personal/webhooker/src/lib/webhook-signature.ts](../src/lib/webhook-signature.ts) - Signature verification utilities
- [/Users/vahid/Workspace/Personal/webhooker/src/lib/filter-expression.ts](../src/lib/filter-expression.ts) - Filter expression evaluator

## Next Steps

To complete the webhook delivery system:

1. **Queue Worker**: Implement a background worker to process pending deliveries
2. **Channel Adapters**: Create adapters for each channel type (Telegram, Slack, Discord, etc.)
3. **Message Templates**: Add Handlebars template rendering for message transformation
4. **Retry Logic**: Implement exponential backoff retry strategy
5. **Rate Limiting**: Add rate limiting per channel to avoid hitting API limits
