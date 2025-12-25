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

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
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
