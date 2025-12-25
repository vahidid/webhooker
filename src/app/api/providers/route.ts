import prisma from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-utils";

// GET /api/providers - List all active providers (public, no auth required)
export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        iconUrl: true,
        eventTypes: true,
        docsUrl: true,
      },
      orderBy: { displayName: "asc" },
    });

    return successResponse(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    return errorResponse("Failed to fetch providers");
  }
}
