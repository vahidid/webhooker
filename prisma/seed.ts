import "dotenv/config";
import prisma from "../src/lib/prisma";

const providers = [
  {
    name: "github",
    displayName: "GitHub",
    description: "GitHub webhooks for repository events, pull requests, issues, and more",
    iconUrl: "/providers/github.svg",
    signatureHeader: "X-Hub-Signature-256",
    signatureAlgo: "HMAC_SHA256" as const,
    eventTypes: [
      "push",
      "pull_request",
      "pull_request_review",
      "issues",
      "issue_comment",
      "create",
      "delete",
      "release",
      "workflow_run",
      "workflow_job",
      "check_run",
      "check_suite",
      "deployment",
      "deployment_status",
      "star",
      "fork",
      "watch",
    ],
    docsUrl: "https://docs.github.com/en/webhooks",
  },
  {
    name: "gitlab",
    displayName: "GitLab",
    description: "GitLab webhooks for merge requests, pipelines, issues, and more",
    iconUrl: "/providers/gitlab.svg",
    signatureHeader: "X-Gitlab-Token",
    signatureAlgo: "NONE" as const,
    eventTypes: [
      "push",
      "tag_push",
      "merge_request",
      "issue",
      "note",
      "pipeline",
      "job",
      "deployment",
      "release",
      "wiki_page",
    ],
    docsUrl: "https://docs.gitlab.com/ee/user/project/integrations/webhooks.html",
  },
  {
    name: "jira",
    displayName: "Jira",
    description: "Jira webhooks for issues, sprints, and project updates",
    iconUrl: "/providers/jira.svg",
    signatureHeader: null,
    signatureAlgo: null,
    eventTypes: [
      "jira:issue_created",
      "jira:issue_updated",
      "jira:issue_deleted",
      "comment_created",
      "comment_updated",
      "comment_deleted",
      "sprint_created",
      "sprint_started",
      "sprint_closed",
      "board_created",
      "board_updated",
    ],
    docsUrl: "https://developer.atlassian.com/server/jira/platform/webhooks/",
  },
  {
    name: "bitbucket",
    displayName: "Bitbucket",
    description: "Bitbucket webhooks for repository and pull request events",
    iconUrl: "/providers/bitbucket.svg",
    signatureHeader: "X-Hub-Signature",
    signatureAlgo: "HMAC_SHA256" as const,
    eventTypes: [
      "repo:push",
      "repo:fork",
      "repo:commit_comment_created",
      "pullrequest:created",
      "pullrequest:updated",
      "pullrequest:approved",
      "pullrequest:unapproved",
      "pullrequest:fulfilled",
      "pullrequest:rejected",
      "pullrequest:comment_created",
    ],
    docsUrl: "https://support.atlassian.com/bitbucket-cloud/docs/manage-webhooks/",
  },
  {
    name: "sentry",
    displayName: "Sentry",
    description: "Sentry webhooks for error tracking and performance monitoring",
    iconUrl: "/providers/sentry.svg",
    signatureHeader: "Sentry-Hook-Signature",
    signatureAlgo: "HMAC_SHA256" as const,
    eventTypes: [
      "issue.created",
      "issue.resolved",
      "issue.ignored",
      "issue.assigned",
      "error.created",
      "comment.created",
      "comment.updated",
      "installation.created",
      "installation.deleted",
    ],
    docsUrl: "https://docs.sentry.io/product/integrations/integration-platform/webhooks/",
  },
  {
    name: "vercel",
    displayName: "Vercel",
    description: "Vercel webhooks for deployment and project events",
    iconUrl: "/providers/vercel.svg",
    signatureHeader: "x-vercel-signature",
    signatureAlgo: "HMAC_SHA1" as const,
    eventTypes: [
      "deployment.created",
      "deployment.succeeded",
      "deployment.ready",
      "deployment.promoted",
      "deployment.canceled",
      "deployment.error",
      "project.created",
      "project.removed",
      "domain.created",
    ],
    docsUrl: "https://vercel.com/docs/observability/webhooks",
  },
  {
    name: "stripe",
    displayName: "Stripe",
    description: "Stripe webhooks for payment and subscription events",
    iconUrl: "/providers/stripe.svg",
    signatureHeader: "Stripe-Signature",
    signatureAlgo: "HMAC_SHA256" as const,
    eventTypes: [
      "payment_intent.succeeded",
      "payment_intent.failed",
      "charge.succeeded",
      "charge.failed",
      "charge.refunded",
      "customer.created",
      "customer.updated",
      "customer.deleted",
      "invoice.paid",
      "invoice.payment_failed",
      "subscription.created",
      "subscription.updated",
      "subscription.deleted",
    ],
    docsUrl: "https://stripe.com/docs/webhooks",
  },
  {
    name: "linear",
    displayName: "Linear",
    description: "Linear webhooks for issue and project management",
    iconUrl: "/providers/linear.svg",
    signatureHeader: "Linear-Signature",
    signatureAlgo: "HMAC_SHA256" as const,
    eventTypes: [
      "Issue",
      "Comment",
      "Cycle",
      "Project",
      "ProjectUpdate",
      "Reaction",
      "IssueLabel",
    ],
    docsUrl: "https://developers.linear.app/docs/graphql/webhooks",
  },
  {
    name: "custom",
    displayName: "Custom Webhook",
    description: "Generic webhook endpoint for any custom integration",
    iconUrl: "/providers/webhook.svg",
    signatureHeader: null,
    signatureAlgo: null,
    eventTypes: ["*"],
    docsUrl: null,
  },
];

async function main() {
  console.log("🌱 Seeding providers...");

  for (const provider of providers) {
    await prisma.provider.upsert({
      where: { name: provider.name },
      update: {
        displayName: provider.displayName,
        description: provider.description,
        iconUrl: provider.iconUrl,
        signatureHeader: provider.signatureHeader,
        signatureAlgo: provider.signatureAlgo,
        eventTypes: provider.eventTypes,
        docsUrl: provider.docsUrl,
      },
      create: provider,
    });
    console.log(`  ✓ ${provider.displayName}`);
  }

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
