import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const CURRENT_ORG_COOKIE = "current-organization";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getAuthenticatedOrganization(): Promise<{
  userId: string;
  organizationId: string;
} | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const cookieStore = await cookies();
  const currentOrgId = cookieStore.get(CURRENT_ORG_COOKIE)?.value;

  if (!currentOrgId) {
    return null;
  }

  // Verify user owns this organization
  const organization = await prisma.organization.findFirst({
    where: {
      id: currentOrgId,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!organization) {
    return null;
  }

  return {
    userId: session.user.id,
    organizationId: organization.id,
  };
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

export function notFoundResponse(resource: string) {
  return NextResponse.json(
    { success: false, error: `${resource} not found` },
    { status: 404 }
  );
}

export function badRequestResponse(error: string) {
  return NextResponse.json(
    { success: false, error },
    { status: 400 }
  );
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

export function errorResponse(error: string, status = 500) {
  return NextResponse.json(
    { success: false, error },
    { status }
  );
}
