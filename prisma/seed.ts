import "dotenv/config";
import prisma from "../src/lib/prisma";

const providers = [
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
      "commit"
    ],
    docsUrl: "https://docs.gitlab.com/ee/user/project/integrations/webhooks.html",
  }
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
