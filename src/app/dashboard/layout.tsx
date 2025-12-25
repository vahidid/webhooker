import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getCurrentOrganization, getUserOrganizations } from "@/lib/actions/organization";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { OrganizationProvider } from "@/components/providers/organization";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const [organizations, currentOrganization] = await Promise.all([
    getUserOrganizations(),
    getCurrentOrganization(),
  ]);

  // If user has no organizations, redirect to onboarding
  if (organizations.length === 0) {
    redirect("/onboarding");
  }

  return (
    <OrganizationProvider
      currentOrganization={currentOrganization}
      organizations={organizations}
    >
      <div className="flex h-screen bg-background">
        <DashboardSidebar
          organizations={organizations}
          currentOrganization={currentOrganization}
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-8">{children}</div>
        </main>
      </div>
    </OrganizationProvider>
  );
}
