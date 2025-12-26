/**
 * GitLab Webhook Payload Schemas
 * These schemas define the structure of GitLab webhook payloads for different event types.
 * Used for autocomplete suggestions in the message template editor.
 */

export interface PayloadField {
  path: string;
  label: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
}

// Common fields that appear in most GitLab webhook payloads
const commonFields: PayloadField[] = [
  { path: "object_kind", label: "object_kind", type: "string", description: "Type of event (e.g., 'merge_request', 'push')" },
  { path: "event_type", label: "event_type", type: "string", description: "Specific event type" },
  { path: "user.id", label: "user.id", type: "number", description: "User ID" },
  { path: "user.name", label: "user.name", type: "string", description: "User full name" },
  { path: "user.username", label: "user.username", type: "string", description: "User username" },
  { path: "user.email", label: "user.email", type: "string", description: "User email" },
  { path: "user.avatar_url", label: "user.avatar_url", type: "string", description: "User avatar URL" },
  { path: "project.id", label: "project.id", type: "number", description: "Project ID" },
  { path: "project.name", label: "project.name", type: "string", description: "Project name" },
  { path: "project.description", label: "project.description", type: "string", description: "Project description" },
  { path: "project.web_url", label: "project.web_url", type: "string", description: "Project web URL" },
  { path: "project.namespace", label: "project.namespace", type: "string", description: "Project namespace" },
  { path: "project.path_with_namespace", label: "project.path_with_namespace", type: "string", description: "Full project path" },
  { path: "project.default_branch", label: "project.default_branch", type: "string", description: "Default branch name" },
  { path: "project.homepage", label: "project.homepage", type: "string", description: "Project homepage URL" },
  { path: "project.url", label: "project.url", type: "string", description: "Project Git URL" },
  { path: "project.ssh_url", label: "project.ssh_url", type: "string", description: "Project SSH URL" },
  { path: "project.http_url", label: "project.http_url", type: "string", description: "Project HTTP URL" },
];

// Merge Request specific fields
const mergeRequestFields: PayloadField[] = [
  ...commonFields,
  { path: "object_attributes.id", label: "object_attributes.id", type: "number", description: "Merge request ID" },
  { path: "object_attributes.iid", label: "object_attributes.iid", type: "number", description: "Merge request internal ID" },
  { path: "object_attributes.title", label: "object_attributes.title", type: "string", description: "Merge request title" },
  { path: "object_attributes.description", label: "object_attributes.description", type: "string", description: "Merge request description" },
  { path: "object_attributes.state", label: "object_attributes.state", type: "string", description: "State (opened, closed, merged)" },
  { path: "object_attributes.action", label: "object_attributes.action", type: "string", description: "Action (open, close, reopen, update, merge)" },
  { path: "object_attributes.source_branch", label: "object_attributes.source_branch", type: "string", description: "Source branch name" },
  { path: "object_attributes.target_branch", label: "object_attributes.target_branch", type: "string", description: "Target branch name" },
  { path: "object_attributes.url", label: "object_attributes.url", type: "string", description: "Merge request URL" },
  { path: "object_attributes.created_at", label: "object_attributes.created_at", type: "string", description: "Creation timestamp" },
  { path: "object_attributes.updated_at", label: "object_attributes.updated_at", type: "string", description: "Last update timestamp" },
  { path: "object_attributes.merged_at", label: "object_attributes.merged_at", type: "string", description: "Merge timestamp" },
  { path: "object_attributes.merge_status", label: "object_attributes.merge_status", type: "string", description: "Merge status" },
  { path: "object_attributes.work_in_progress", label: "object_attributes.work_in_progress", type: "boolean", description: "Is WIP/Draft" },
  { path: "object_attributes.draft", label: "object_attributes.draft", type: "boolean", description: "Is draft MR" },
  { path: "object_attributes.author_id", label: "object_attributes.author_id", type: "number", description: "Author user ID" },
  { path: "object_attributes.assignee_id", label: "object_attributes.assignee_id", type: "number", description: "Assignee user ID" },
  { path: "assignees", label: "assignees", type: "array", description: "List of assignees" },
  { path: "reviewers", label: "reviewers", type: "array", description: "List of reviewers" },
  { path: "labels", label: "labels", type: "array", description: "List of labels" },
  { path: "changes.title.previous", label: "changes.title.previous", type: "string", description: "Previous title" },
  { path: "changes.title.current", label: "changes.title.current", type: "string", description: "Current title" },
];

// Push event specific fields
const pushFields: PayloadField[] = [
  ...commonFields,
  { path: "before", label: "before", type: "string", description: "SHA before push" },
  { path: "after", label: "after", type: "string", description: "SHA after push" },
  { path: "ref", label: "ref", type: "string", description: "Git ref (e.g., refs/heads/main)" },
  { path: "checkout_sha", label: "checkout_sha", type: "string", description: "Checkout SHA" },
  { path: "user_id", label: "user_id", type: "number", description: "User ID" },
  { path: "user_name", label: "user_name", type: "string", description: "User name" },
  { path: "user_username", label: "user_username", type: "string", description: "User username" },
  { path: "user_email", label: "user_email", type: "string", description: "User email" },
  { path: "user_avatar", label: "user_avatar", type: "string", description: "User avatar URL" },
  { path: "total_commits_count", label: "total_commits_count", type: "number", description: "Total number of commits" },
  { path: "commits", label: "commits", type: "array", description: "List of commits" },
  { path: "commits[0].id", label: "commits[0].id", type: "string", description: "First commit SHA" },
  { path: "commits[0].message", label: "commits[0].message", type: "string", description: "First commit message" },
  { path: "commits[0].title", label: "commits[0].title", type: "string", description: "First commit title" },
  { path: "commits[0].timestamp", label: "commits[0].timestamp", type: "string", description: "First commit timestamp" },
  { path: "commits[0].url", label: "commits[0].url", type: "string", description: "First commit URL" },
  { path: "commits[0].author.name", label: "commits[0].author.name", type: "string", description: "Commit author name" },
  { path: "commits[0].author.email", label: "commits[0].author.email", type: "string", description: "Commit author email" },
];

// Pipeline event specific fields
const pipelineFields: PayloadField[] = [
  ...commonFields,
  { path: "object_attributes.id", label: "object_attributes.id", type: "number", description: "Pipeline ID" },
  { path: "object_attributes.iid", label: "object_attributes.iid", type: "number", description: "Pipeline internal ID" },
  { path: "object_attributes.ref", label: "object_attributes.ref", type: "string", description: "Git ref" },
  { path: "object_attributes.sha", label: "object_attributes.sha", type: "string", description: "Commit SHA" },
  { path: "object_attributes.status", label: "object_attributes.status", type: "string", description: "Pipeline status (success, failed, running, pending)" },
  { path: "object_attributes.detailed_status", label: "object_attributes.detailed_status", type: "string", description: "Detailed status" },
  { path: "object_attributes.source", label: "object_attributes.source", type: "string", description: "Pipeline source (push, web, trigger, schedule)" },
  { path: "object_attributes.created_at", label: "object_attributes.created_at", type: "string", description: "Creation timestamp" },
  { path: "object_attributes.finished_at", label: "object_attributes.finished_at", type: "string", description: "Finish timestamp" },
  { path: "object_attributes.duration", label: "object_attributes.duration", type: "number", description: "Duration in seconds" },
  { path: "object_attributes.queued_duration", label: "object_attributes.queued_duration", type: "number", description: "Queue duration in seconds" },
  { path: "object_attributes.url", label: "object_attributes.url", type: "string", description: "Pipeline URL" },
  { path: "merge_request.id", label: "merge_request.id", type: "number", description: "Related MR ID" },
  { path: "merge_request.iid", label: "merge_request.iid", type: "number", description: "Related MR internal ID" },
  { path: "merge_request.title", label: "merge_request.title", type: "string", description: "Related MR title" },
  { path: "merge_request.url", label: "merge_request.url", type: "string", description: "Related MR URL" },
  { path: "builds", label: "builds", type: "array", description: "List of jobs/builds" },
];

// Issue event specific fields
const issueFields: PayloadField[] = [
  ...commonFields,
  { path: "object_attributes.id", label: "object_attributes.id", type: "number", description: "Issue ID" },
  { path: "object_attributes.iid", label: "object_attributes.iid", type: "number", description: "Issue internal ID" },
  { path: "object_attributes.title", label: "object_attributes.title", type: "string", description: "Issue title" },
  { path: "object_attributes.description", label: "object_attributes.description", type: "string", description: "Issue description" },
  { path: "object_attributes.state", label: "object_attributes.state", type: "string", description: "Issue state (opened, closed)" },
  { path: "object_attributes.action", label: "object_attributes.action", type: "string", description: "Action (open, close, reopen, update)" },
  { path: "object_attributes.url", label: "object_attributes.url", type: "string", description: "Issue URL" },
  { path: "object_attributes.created_at", label: "object_attributes.created_at", type: "string", description: "Creation timestamp" },
  { path: "object_attributes.updated_at", label: "object_attributes.updated_at", type: "string", description: "Last update timestamp" },
  { path: "object_attributes.closed_at", label: "object_attributes.closed_at", type: "string", description: "Close timestamp" },
  { path: "object_attributes.due_date", label: "object_attributes.due_date", type: "string", description: "Due date" },
  { path: "object_attributes.confidential", label: "object_attributes.confidential", type: "boolean", description: "Is confidential" },
  { path: "assignees", label: "assignees", type: "array", description: "List of assignees" },
  { path: "labels", label: "labels", type: "array", description: "List of labels" },
];

// Note (comment) event specific fields
const noteFields: PayloadField[] = [
  ...commonFields,
  { path: "object_attributes.id", label: "object_attributes.id", type: "number", description: "Note ID" },
  { path: "object_attributes.note", label: "object_attributes.note", type: "string", description: "Note content" },
  { path: "object_attributes.noteable_type", label: "object_attributes.noteable_type", type: "string", description: "Type (Issue, MergeRequest, Commit, Snippet)" },
  { path: "object_attributes.author_id", label: "object_attributes.author_id", type: "number", description: "Author ID" },
  { path: "object_attributes.created_at", label: "object_attributes.created_at", type: "string", description: "Creation timestamp" },
  { path: "object_attributes.updated_at", label: "object_attributes.updated_at", type: "string", description: "Update timestamp" },
  { path: "object_attributes.url", label: "object_attributes.url", type: "string", description: "Note URL" },
  { path: "merge_request.id", label: "merge_request.id", type: "number", description: "Related MR ID" },
  { path: "merge_request.iid", label: "merge_request.iid", type: "number", description: "Related MR internal ID" },
  { path: "merge_request.title", label: "merge_request.title", type: "string", description: "Related MR title" },
  { path: "issue.id", label: "issue.id", type: "number", description: "Related issue ID" },
  { path: "issue.iid", label: "issue.iid", type: "number", description: "Related issue internal ID" },
  { path: "issue.title", label: "issue.title", type: "string", description: "Related issue title" },
];

// Tag push event specific fields
const tagPushFields: PayloadField[] = [
  ...commonFields,
  { path: "before", label: "before", type: "string", description: "SHA before (all zeros for new tag)" },
  { path: "after", label: "after", type: "string", description: "SHA after (all zeros for deleted tag)" },
  { path: "ref", label: "ref", type: "string", description: "Tag ref (refs/tags/v1.0.0)" },
  { path: "checkout_sha", label: "checkout_sha", type: "string", description: "Checkout SHA" },
  { path: "user_id", label: "user_id", type: "number", description: "User ID" },
  { path: "user_name", label: "user_name", type: "string", description: "User name" },
  { path: "user_username", label: "user_username", type: "string", description: "User username" },
  { path: "user_avatar", label: "user_avatar", type: "string", description: "User avatar URL" },
  { path: "total_commits_count", label: "total_commits_count", type: "number", description: "Total commits count" },
  { path: "commits", label: "commits", type: "array", description: "List of commits" },
];

// Job event specific fields
const jobFields: PayloadField[] = [
  ...commonFields,
  { path: "build_id", label: "build_id", type: "number", description: "Job/build ID" },
  { path: "build_name", label: "build_name", type: "string", description: "Job name" },
  { path: "build_stage", label: "build_stage", type: "string", description: "Job stage" },
  { path: "build_status", label: "build_status", type: "string", description: "Job status" },
  { path: "build_started_at", label: "build_started_at", type: "string", description: "Start timestamp" },
  { path: "build_finished_at", label: "build_finished_at", type: "string", description: "Finish timestamp" },
  { path: "build_duration", label: "build_duration", type: "number", description: "Duration in seconds" },
  { path: "build_queued_duration", label: "build_queued_duration", type: "number", description: "Queue duration" },
  { path: "build_allow_failure", label: "build_allow_failure", type: "boolean", description: "Allow failure flag" },
  { path: "build_failure_reason", label: "build_failure_reason", type: "string", description: "Failure reason" },
  { path: "pipeline_id", label: "pipeline_id", type: "number", description: "Pipeline ID" },
  { path: "runner.id", label: "runner.id", type: "number", description: "Runner ID" },
  { path: "runner.description", label: "runner.description", type: "string", description: "Runner description" },
  { path: "runner.runner_type", label: "runner.runner_type", type: "string", description: "Runner type" },
  { path: "ref", label: "ref", type: "string", description: "Git ref" },
  { path: "sha", label: "sha", type: "string", description: "Commit SHA" },
  { path: "environment", label: "environment", type: "string", description: "Environment name" },
];

// Deployment event specific fields
const deploymentFields: PayloadField[] = [
  ...commonFields,
  { path: "deployment_id", label: "deployment_id", type: "number", description: "Deployment ID" },
  { path: "status", label: "status", type: "string", description: "Deployment status (created, running, success, failed, canceled)" },
  { path: "status_changed_at", label: "status_changed_at", type: "string", description: "Status change timestamp" },
  { path: "environment", label: "environment", type: "string", description: "Environment name" },
  { path: "deployable_id", label: "deployable_id", type: "number", description: "Deployable job ID" },
  { path: "deployable_url", label: "deployable_url", type: "string", description: "Deployable URL" },
  { path: "short_sha", label: "short_sha", type: "string", description: "Short commit SHA" },
  { path: "commit_title", label: "commit_title", type: "string", description: "Commit title" },
  { path: "commit_url", label: "commit_url", type: "string", description: "Commit URL" },
  { path: "ref", label: "ref", type: "string", description: "Git ref" },
];

// Release event specific fields
const releaseFields: PayloadField[] = [
  ...commonFields,
  { path: "action", label: "action", type: "string", description: "Action (create, update, delete)" },
  { path: "name", label: "name", type: "string", description: "Release name" },
  { path: "tag", label: "tag", type: "string", description: "Release tag" },
  { path: "description", label: "description", type: "string", description: "Release description" },
  { path: "url", label: "url", type: "string", description: "Release URL" },
  { path: "created_at", label: "created_at", type: "string", description: "Creation timestamp" },
  { path: "released_at", label: "released_at", type: "string", description: "Release timestamp" },
  { path: "commit.id", label: "commit.id", type: "string", description: "Commit SHA" },
  { path: "commit.message", label: "commit.message", type: "string", description: "Commit message" },
  { path: "commit.title", label: "commit.title", type: "string", description: "Commit title" },
  { path: "commit.url", label: "commit.url", type: "string", description: "Commit URL" },
  { path: "assets.count", label: "assets.count", type: "number", description: "Number of assets" },
  { path: "assets.links", label: "assets.links", type: "array", description: "Asset links" },
  { path: "assets.sources", label: "assets.sources", type: "array", description: "Source archives" },
];

// Wiki page event specific fields
const wikiPageFields: PayloadField[] = [
  ...commonFields,
  { path: "object_attributes.title", label: "object_attributes.title", type: "string", description: "Wiki page title" },
  { path: "object_attributes.content", label: "object_attributes.content", type: "string", description: "Wiki page content" },
  { path: "object_attributes.format", label: "object_attributes.format", type: "string", description: "Content format (markdown, rdoc, etc.)" },
  { path: "object_attributes.slug", label: "object_attributes.slug", type: "string", description: "URL slug" },
  { path: "object_attributes.url", label: "object_attributes.url", type: "string", description: "Wiki page URL" },
  { path: "object_attributes.action", label: "object_attributes.action", type: "string", description: "Action (create, update, delete)" },
  { path: "object_attributes.message", label: "object_attributes.message", type: "string", description: "Commit message" },
];

// Map event types to their payload fields
export const gitlabEventPayloadFields: Record<string, PayloadField[]> = {
  push: pushFields,
  tag_push: tagPushFields,
  merge_request: mergeRequestFields,
  issue: issueFields,
  note: noteFields,
  pipeline: pipelineFields,
  job: jobFields,
  deployment: deploymentFields,
  release: releaseFields,
  wiki_page: wikiPageFields,
};

/**
 * Get all unique payload fields for given event types
 */
export function getPayloadFieldsForEvents(eventTypes: string[]): PayloadField[] {
  if (eventTypes.length === 0) {
    // Return common fields if no specific events selected
    return commonFields;
  }

  const fieldsMap = new Map<string, PayloadField>();
  
  for (const eventType of eventTypes) {
    const fields = gitlabEventPayloadFields[eventType] || commonFields;
    for (const field of fields) {
      if (!fieldsMap.has(field.path)) {
        fieldsMap.set(field.path, field);
      }
    }
  }

  return Array.from(fieldsMap.values());
}

/**
 * Get autocomplete suggestions for a partial path
 */
export function getAutocompleteSuggestions(
  eventTypes: string[],
  partialPath: string
): PayloadField[] {
  const allFields = getPayloadFieldsForEvents(eventTypes);
  const lowerPartial = partialPath.toLowerCase();
  
  return allFields
    .filter((field) => 
      field.path.toLowerCase().includes(lowerPartial) ||
      field.label.toLowerCase().includes(lowerPartial) ||
      (field.description?.toLowerCase().includes(lowerPartial))
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
