"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createOrganizationSchema, type CreateOrganizationFormData } from "@/lib/validations/organization";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const CURRENT_ORG_COOKIE = "current-organization";

export type OrganizationResult = {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    name: string;
    slug: string;
  };
};

export async function createOrganization(
  data: CreateOrganizationFormData
): Promise<OrganizationResult> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to create an organization" };
    }

    const validatedFields = createOrganizationSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    const { name, slug, memberCount } = validatedFields.data;

    // Check if slug is already taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      return { success: false, error: "This slug is already taken" };
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        memberCount,
        userId: session.user.id,
      },
    });

    // Set as current organization
    const cookieStore = await cookies();
    cookieStore.set(CURRENT_ORG_COOKIE, organization.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    };
  } catch (error) {
    console.error("Create organization error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function getUserOrganizations() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return [];
    }

    const organizations = await prisma.organization.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      memberCount: org.memberCount,
      logo: org.logo,
    }));
  } catch (error) {
    console.error("Get organizations error:", error);
    return [];
  }
}

export async function getCurrentOrganization() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    const cookieStore = await cookies();
    const currentOrgId = cookieStore.get(CURRENT_ORG_COOKIE)?.value;

    if (currentOrgId) {
      // Verify user owns this organization
      const organization = await prisma.organization.findFirst({
        where: {
          id: currentOrgId,
          userId: session.user.id,
        },
      });

      if (organization) {
        return {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          memberCount: organization.memberCount,
          logo: organization.logo,
        };
      }
    }

    // If no current org or access denied, get first organization
    const organizations = await getUserOrganizations();
    if (organizations.length > 0) {
      await setCurrentOrganization(organizations[0].id);
      return organizations[0];
    }

    return null;
  } catch (error) {
    console.error("Get current organization error:", error);
    return null;
  }
}

export async function setCurrentOrganization(organizationId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify user owns this organization
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        userId: session.user.id,
      },
    });

    if (!organization) {
      return { success: false, error: "Access denied" };
    }

    const cookieStore = await cookies();
    cookieStore.set(CURRENT_ORG_COOKIE, organizationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Set current organization error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function checkSlugAvailability(slug: string) {
  try {
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    return { available: !existingOrg };
  } catch (error) {
    console.error("Check slug error:", error);
    return { available: false };
  }
}
