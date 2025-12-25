import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Base API Response Types
 */

export interface ApiSuccessResponse<T = unknown> {
	success: true;
	data: T;
	message?: string;
}

export interface ApiErrorResponse {
	success: false;
	error: string;
	message?: string;
	details?: Array<{
		field: string;
		message: string;
	}>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination Types
 */
export interface PaginationParams {
	page?: number;
	limit?: number;
}

export interface CursorPaginationParams {
	cursor?: string;
	limit?: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface CursorPaginatedResponse<T> {
	data: T[];
	nextCursor: string | null;
	hasMore?: boolean;
}

/**
 * Type Guards
 */
export function isApiError(
	response: ApiResponse,
): response is ApiErrorResponse {
	return response.success === false;
}

export function isApiSuccess<T>(
	response: ApiResponse<T>,
): response is ApiSuccessResponse<T> {
	return response.success === true;
}

/**
 * Authentication Context Type
 */
export interface AuthContext {
	userId: string;
	organizationId: string;
}

/**
 * Server-side API Helper Functions
 */

const CURRENT_ORG_COOKIE = "current-organization";

/**
 * Get authenticated user and their current organization
 * Returns null if user is not authenticated or no organization is selected
 */
export async function getAuthenticatedOrganization(): Promise<AuthContext | null> {
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

/**
 * Response Helper Functions
 * These functions create standardized JSON responses for API routes
 */

export function unauthorizedResponse(message = "Unauthorized") {
	return NextResponse.json<ApiErrorResponse>(
		{ success: false, error: message },
		{ status: 401 }
	);
}

export function notFoundResponse(resource: string) {
	return NextResponse.json<ApiErrorResponse>(
		{ success: false, error: `${resource} not found` },
		{ status: 404 }
	);
}

export function badRequestResponse(error: string, details?: ApiErrorResponse["details"]) {
	return NextResponse.json<ApiErrorResponse>(
		{ success: false, error, ...(details && { details }) },
		{ status: 400 }
	);
}

export function conflictResponse(error: string) {
	return NextResponse.json<ApiErrorResponse>(
		{ success: false, error },
		{ status: 409 }
	);
}

export function successResponse<T>(data: T, status = 200, message?: string) {
	return NextResponse.json<ApiSuccessResponse<T>>(
		{ success: true, data, ...(message && { message }) },
		{ status }
	);
}

export function errorResponse(error: string, status = 500) {
	return NextResponse.json<ApiErrorResponse>(
		{ success: false, error },
		{ status }
	);
}

/**
 * Helper to create cursor-paginated response
 */
export function cursorPaginatedResponse<T>(
	data: T[],
	nextCursor: string | null,
	status = 200
) {
	return NextResponse.json<ApiSuccessResponse<CursorPaginatedResponse<T>>>(
		{
			success: true,
			data: {
				data,
				nextCursor,
				hasMore: nextCursor !== null,
			},
		},
		{ status }
	);
}

/**
 * Helper to create standard paginated response
 */
export function paginatedResponse<T>(
	data: T[],
	pagination: PaginatedResponse<T>["pagination"],
	status = 200
) {
	return NextResponse.json<ApiSuccessResponse<PaginatedResponse<T>>>(
		{
			success: true,
			data: {
				data,
				pagination,
			},
		},
		{ status }
	);
}

