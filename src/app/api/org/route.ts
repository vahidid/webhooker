import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createOrganizationSchema } from "@/lib/validations/organization";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const CURRENT_ORG_COOKIE = "current-organization";


export async function POST(req: NextRequest) {
try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to create an organization" };
    }

    const data = await req.json();

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