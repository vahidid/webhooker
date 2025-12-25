import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUserOrganizations } from "@/lib/actions/organization";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // If user already has organizations, redirect to dashboard
  const organizations = await getUserOrganizations();
  if (organizations.length > 0) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
