/**
 * GitHub Webhook Payload Schemas
 * These schemas define the structure of GitHub webhook payloads for different event types.
 * @see https://docs.github.com/en/webhooks/webhook-events-and-payloads
 */

import type { PayloadField, ProviderPayloadSchemas } from "./types";

// Common fields that appear in most GitHub webhook payloads
const commonFields: PayloadField[] = [
  { path: "action", label: "action", type: "string", description: "Action performed (e.g., opened, closed, reopened)" },
  { path: "sender.id", label: "sender.id", type: "number", description: "Sender user ID" },
  { path: "sender.login", label: "sender.login", type: "string", description: "Sender username" },
  { path: "sender.avatar_url", label: "sender.avatar_url", type: "string", description: "Sender avatar URL" },
  { path: "sender.html_url", label: "sender.html_url", type: "string", description: "Sender profile URL" },
  { path: "repository.id", label: "repository.id", type: "number", description: "Repository ID" },
  { path: "repository.name", label: "repository.name", type: "string", description: "Repository name" },
  { path: "repository.full_name", label: "repository.full_name", type: "string", description: "Full repository name (owner/repo)" },
  { path: "repository.description", label: "repository.description", type: "string", description: "Repository description" },
  { path: "repository.html_url", label: "repository.html_url", type: "string", description: "Repository URL" },
  { path: "repository.default_branch", label: "repository.default_branch", type: "string", description: "Default branch name" },
  { path: "repository.owner.login", label: "repository.owner.login", type: "string", description: "Repository owner username" },
  { path: "repository.owner.avatar_url", label: "repository.owner.avatar_url", type: "string", description: "Owner avatar URL" },
  { path: "organization.login", label: "organization.login", type: "string", description: "Organization name" },
  { path: "organization.avatar_url", label: "organization.avatar_url", type: "string", description: "Organization avatar URL" },
];

// Pull Request event specific fields
const pullRequestFields: PayloadField[] = [
  ...commonFields,
  { path: "number", label: "number", type: "number", description: "Pull request number" },
  { path: "pull_request.id", label: "pull_request.id", type: "number", description: "Pull request ID" },
  { path: "pull_request.number", label: "pull_request.number", type: "number", description: "Pull request number" },
  { path: "pull_request.title", label: "pull_request.title", type: "string", description: "Pull request title" },
  { path: "pull_request.body", label: "pull_request.body", type: "string", description: "Pull request description" },
  { path: "pull_request.state", label: "pull_request.state", type: "string", description: "State (open, closed)" },
  { path: "pull_request.draft", label: "pull_request.draft", type: "boolean", description: "Is draft PR" },
  { path: "pull_request.merged", label: "pull_request.merged", type: "boolean", description: "Is merged" },
  { path: "pull_request.merged_at", label: "pull_request.merged_at", type: "string", description: "Merge timestamp" },
  { path: "pull_request.html_url", label: "pull_request.html_url", type: "string", description: "Pull request URL" },
  { path: "pull_request.created_at", label: "pull_request.created_at", type: "string", description: "Creation timestamp" },
  { path: "pull_request.updated_at", label: "pull_request.updated_at", type: "string", description: "Last update timestamp" },
  { path: "pull_request.head.ref", label: "pull_request.head.ref", type: "string", description: "Source branch name" },
  { path: "pull_request.head.sha", label: "pull_request.head.sha", type: "string", description: "Source commit SHA" },
  { path: "pull_request.base.ref", label: "pull_request.base.ref", type: "string", description: "Target branch name" },
  { path: "pull_request.base.sha", label: "pull_request.base.sha", type: "string", description: "Target commit SHA" },
  { path: "pull_request.user.login", label: "pull_request.user.login", type: "string", description: "Author username" },
  { path: "pull_request.user.avatar_url", label: "pull_request.user.avatar_url", type: "string", description: "Author avatar URL" },
  { path: "pull_request.assignee.login", label: "pull_request.assignee.login", type: "string", description: "Assignee username" },
  { path: "pull_request.assignees", label: "pull_request.assignees", type: "array", description: "List of assignees" },
  { path: "pull_request.requested_reviewers", label: "pull_request.requested_reviewers", type: "array", description: "List of reviewers" },
  { path: "pull_request.labels", label: "pull_request.labels", type: "array", description: "List of labels" },
  { path: "pull_request.additions", label: "pull_request.additions", type: "number", description: "Lines added" },
  { path: "pull_request.deletions", label: "pull_request.deletions", type: "number", description: "Lines deleted" },
  { path: "pull_request.changed_files", label: "pull_request.changed_files", type: "number", description: "Number of changed files" },
];

// Push event specific fields
const pushFields: PayloadField[] = [
  ...commonFields,
  { path: "ref", label: "ref", type: "string", description: "Git ref (e.g., refs/heads/main)" },
  { path: "before", label: "before", type: "string", description: "SHA before push" },
  { path: "after", label: "after", type: "string", description: "SHA after push" },
  { path: "created", label: "created", type: "boolean", description: "Branch was created" },
  { path: "deleted", label: "deleted", type: "boolean", description: "Branch was deleted" },
  { path: "forced", label: "forced", type: "boolean", description: "Was force push" },
  { path: "compare", label: "compare", type: "string", description: "Comparison URL" },
  { path: "commits", label: "commits", type: "array", description: "List of commits" },
  { path: "commits[0].id", label: "commits[0].id", type: "string", description: "First commit SHA" },
  { path: "commits[0].message", label: "commits[0].message", type: "string", description: "First commit message" },
  { path: "commits[0].timestamp", label: "commits[0].timestamp", type: "string", description: "First commit timestamp" },
  { path: "commits[0].url", label: "commits[0].url", type: "string", description: "First commit URL" },
  { path: "commits[0].author.name", label: "commits[0].author.name", type: "string", description: "Commit author name" },
  { path: "commits[0].author.email", label: "commits[0].author.email", type: "string", description: "Commit author email" },
  { path: "commits[0].author.username", label: "commits[0].author.username", type: "string", description: "Commit author username" },
  { path: "head_commit.id", label: "head_commit.id", type: "string", description: "Head commit SHA" },
  { path: "head_commit.message", label: "head_commit.message", type: "string", description: "Head commit message" },
  { path: "head_commit.timestamp", label: "head_commit.timestamp", type: "string", description: "Head commit timestamp" },
  { path: "head_commit.url", label: "head_commit.url", type: "string", description: "Head commit URL" },
  { path: "head_commit.author.name", label: "head_commit.author.name", type: "string", description: "Head commit author name" },
  { path: "head_commit.author.email", label: "head_commit.author.email", type: "string", description: "Head commit author email" },
  { path: "pusher.name", label: "pusher.name", type: "string", description: "Pusher name" },
  { path: "pusher.email", label: "pusher.email", type: "string", description: "Pusher email" },
];

// Issues event specific fields
const issuesFields: PayloadField[] = [
  ...commonFields,
  { path: "issue.id", label: "issue.id", type: "number", description: "Issue ID" },
  { path: "issue.number", label: "issue.number", type: "number", description: "Issue number" },
  { path: "issue.title", label: "issue.title", type: "string", description: "Issue title" },
  { path: "issue.body", label: "issue.body", type: "string", description: "Issue description" },
  { path: "issue.state", label: "issue.state", type: "string", description: "State (open, closed)" },
  { path: "issue.html_url", label: "issue.html_url", type: "string", description: "Issue URL" },
  { path: "issue.created_at", label: "issue.created_at", type: "string", description: "Creation timestamp" },
  { path: "issue.updated_at", label: "issue.updated_at", type: "string", description: "Last update timestamp" },
  { path: "issue.closed_at", label: "issue.closed_at", type: "string", description: "Close timestamp" },
  { path: "issue.user.login", label: "issue.user.login", type: "string", description: "Author username" },
  { path: "issue.user.avatar_url", label: "issue.user.avatar_url", type: "string", description: "Author avatar URL" },
  { path: "issue.assignee.login", label: "issue.assignee.login", type: "string", description: "Assignee username" },
  { path: "issue.assignees", label: "issue.assignees", type: "array", description: "List of assignees" },
  { path: "issue.labels", label: "issue.labels", type: "array", description: "List of labels" },
  { path: "issue.milestone.title", label: "issue.milestone.title", type: "string", description: "Milestone title" },
  { path: "issue.comments", label: "issue.comments", type: "number", description: "Number of comments" },
];

// Issue Comment event specific fields
const issueCommentFields: PayloadField[] = [
  ...issuesFields,
  { path: "comment.id", label: "comment.id", type: "number", description: "Comment ID" },
  { path: "comment.body", label: "comment.body", type: "string", description: "Comment text" },
  { path: "comment.html_url", label: "comment.html_url", type: "string", description: "Comment URL" },
  { path: "comment.created_at", label: "comment.created_at", type: "string", description: "Creation timestamp" },
  { path: "comment.updated_at", label: "comment.updated_at", type: "string", description: "Update timestamp" },
  { path: "comment.user.login", label: "comment.user.login", type: "string", description: "Commenter username" },
  { path: "comment.user.avatar_url", label: "comment.user.avatar_url", type: "string", description: "Commenter avatar URL" },
];

// Release event specific fields
const releaseFields: PayloadField[] = [
  ...commonFields,
  { path: "release.id", label: "release.id", type: "number", description: "Release ID" },
  { path: "release.tag_name", label: "release.tag_name", type: "string", description: "Release tag name" },
  { path: "release.name", label: "release.name", type: "string", description: "Release name" },
  { path: "release.body", label: "release.body", type: "string", description: "Release notes" },
  { path: "release.draft", label: "release.draft", type: "boolean", description: "Is draft release" },
  { path: "release.prerelease", label: "release.prerelease", type: "boolean", description: "Is prerelease" },
  { path: "release.html_url", label: "release.html_url", type: "string", description: "Release URL" },
  { path: "release.created_at", label: "release.created_at", type: "string", description: "Creation timestamp" },
  { path: "release.published_at", label: "release.published_at", type: "string", description: "Publish timestamp" },
  { path: "release.author.login", label: "release.author.login", type: "string", description: "Author username" },
  { path: "release.author.avatar_url", label: "release.author.avatar_url", type: "string", description: "Author avatar URL" },
  { path: "release.assets", label: "release.assets", type: "array", description: "Release assets" },
  { path: "release.tarball_url", label: "release.tarball_url", type: "string", description: "Tarball download URL" },
  { path: "release.zipball_url", label: "release.zipball_url", type: "string", description: "Zipball download URL" },
];

// Workflow Run event specific fields
const workflowRunFields: PayloadField[] = [
  ...commonFields,
  { path: "workflow_run.id", label: "workflow_run.id", type: "number", description: "Workflow run ID" },
  { path: "workflow_run.name", label: "workflow_run.name", type: "string", description: "Workflow name" },
  { path: "workflow_run.head_branch", label: "workflow_run.head_branch", type: "string", description: "Branch name" },
  { path: "workflow_run.head_sha", label: "workflow_run.head_sha", type: "string", description: "Commit SHA" },
  { path: "workflow_run.status", label: "workflow_run.status", type: "string", description: "Run status (queued, in_progress, completed)" },
  { path: "workflow_run.conclusion", label: "workflow_run.conclusion", type: "string", description: "Run conclusion (success, failure, cancelled)" },
  { path: "workflow_run.html_url", label: "workflow_run.html_url", type: "string", description: "Workflow run URL" },
  { path: "workflow_run.created_at", label: "workflow_run.created_at", type: "string", description: "Creation timestamp" },
  { path: "workflow_run.updated_at", label: "workflow_run.updated_at", type: "string", description: "Update timestamp" },
  { path: "workflow_run.run_number", label: "workflow_run.run_number", type: "number", description: "Run number" },
  { path: "workflow_run.event", label: "workflow_run.event", type: "string", description: "Triggering event" },
  { path: "workflow.id", label: "workflow.id", type: "number", description: "Workflow ID" },
  { path: "workflow.name", label: "workflow.name", type: "string", description: "Workflow name" },
  { path: "workflow.path", label: "workflow.path", type: "string", description: "Workflow file path" },
];

// Star event specific fields
const starFields: PayloadField[] = [
  ...commonFields,
  { path: "starred_at", label: "starred_at", type: "string", description: "Star timestamp" },
];

// Fork event specific fields
const forkFields: PayloadField[] = [
  ...commonFields,
  { path: "forkee.id", label: "forkee.id", type: "number", description: "Forked repository ID" },
  { path: "forkee.name", label: "forkee.name", type: "string", description: "Forked repository name" },
  { path: "forkee.full_name", label: "forkee.full_name", type: "string", description: "Full repository name" },
  { path: "forkee.html_url", label: "forkee.html_url", type: "string", description: "Forked repository URL" },
  { path: "forkee.owner.login", label: "forkee.owner.login", type: "string", description: "Fork owner username" },
  { path: "forkee.created_at", label: "forkee.created_at", type: "string", description: "Fork creation timestamp" },
];

// Watch event specific fields (repository watch/star)
const watchFields: PayloadField[] = [
  ...commonFields,
];

// Create event specific fields (branch/tag creation)
const createFields: PayloadField[] = [
  ...commonFields,
  { path: "ref", label: "ref", type: "string", description: "Git ref created" },
  { path: "ref_type", label: "ref_type", type: "string", description: "Type (branch or tag)" },
  { path: "master_branch", label: "master_branch", type: "string", description: "Default branch name" },
  { path: "description", label: "description", type: "string", description: "Repository description" },
  { path: "pusher_type", label: "pusher_type", type: "string", description: "Pusher type (user or deploy key)" },
];

// Delete event specific fields (branch/tag deletion)
const deleteFields: PayloadField[] = [
  ...commonFields,
  { path: "ref", label: "ref", type: "string", description: "Git ref deleted" },
  { path: "ref_type", label: "ref_type", type: "string", description: "Type (branch or tag)" },
  { path: "pusher_type", label: "pusher_type", type: "string", description: "Pusher type (user or deploy key)" },
];

/**
 * GitHub provider payload schemas
 * Maps event types to their payload field definitions
 */
export const githubPayloadSchemas: ProviderPayloadSchemas = {
  common: commonFields,
  events: {
    pull_request: pullRequestFields,
    push: pushFields,
    issues: issuesFields,
    issue_comment: issueCommentFields,
    release: releaseFields,
    workflow_run: workflowRunFields,
    star: starFields,
    fork: forkFields,
    watch: watchFields,
    create: createFields,
    delete: deleteFields,
  },
};
