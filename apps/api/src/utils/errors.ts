export enum ErrorCode {
	// Client errors (400-499)
	BAD_REQUEST = "BAD_REQUEST",
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",
	NOT_FOUND = "NOT_FOUND",
	INVALID_REQUEST = "INVALID_REQUEST",
	INVALID_TOKEN = "INVALID_TOKEN",
	MISSING_PROJECT_ID = "MISSING_PROJECT_ID",
	MISSING_DEVICE_TOKEN = "MISSING_DEVICE_TOKEN",
	PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND",

	// Server errors (500-599)
	INTERNAL_ERROR = "INTERNAL_ERROR",
	PROVIDER_ERROR = "PROVIDER_ERROR",
	DATABASE_ERROR = "DATABASE_ERROR",
	VALIDATION_ERROR = "VALIDATION_ERROR",
	TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
}

export interface ApiError {
	code: ErrorCode;
	message: string;
	details?: Record<string, unknown>;
	status: number;
}

export class AppError extends Error {
	code: ErrorCode;
	status: number;
	details?: Record<string, unknown>;

	constructor(
		code: ErrorCode,
		message: string,
		status = 500,
		details?: Record<string, unknown>,
	) {
		super(message);
		this.name = "AppError";
		this.code = code;
		this.status = status;
		this.details = details;
	}

	toResponse(): ApiError {
		return {
			code: this.code,
			message: this.message,
			details: this.details,
			status: this.status,
		};
	}
}

export const errorMap = {
	[ErrorCode.BAD_REQUEST]: { status: 400, message: "Bad request" },
	[ErrorCode.UNAUTHORIZED]: { status: 401, message: "Unauthorized" },
	[ErrorCode.FORBIDDEN]: { status: 403, message: "Forbidden" },
	[ErrorCode.NOT_FOUND]: { status: 404, message: "Resource not found" },
	[ErrorCode.INVALID_REQUEST]: { status: 400, message: "Invalid request" },
	[ErrorCode.INVALID_TOKEN]: { status: 401, message: "Invalid token" },
	[ErrorCode.MISSING_PROJECT_ID]: {
		status: 401,
		message: "Missing project id",
	},
	[ErrorCode.MISSING_DEVICE_TOKEN]: {
		status: 401,
		message: "Missing device token",
	},
	[ErrorCode.PROJECT_NOT_FOUND]: { status: 404, message: "Project not found" },
	[ErrorCode.INTERNAL_ERROR]: { status: 500, message: "Internal server error" },
	[ErrorCode.PROVIDER_ERROR]: { status: 502, message: "Provider error" },
	[ErrorCode.DATABASE_ERROR]: { status: 500, message: "Database error" },
	[ErrorCode.VALIDATION_ERROR]: { status: 400, message: "Validation error" },
	[ErrorCode.TOO_MANY_REQUESTS]: { status: 429, message: "Too many requests" },
};

export function createError(
	code: ErrorCode,
	message?: string,
	details?: Record<string, unknown>,
): AppError {
	const errorInfo = errorMap[code];
	return new AppError(
		code,
		message ?? errorInfo.message,
		errorInfo.status,
		details,
	);
}

export function handleApiError(error: unknown): ApiError {
	if (error instanceof AppError) {
		return error.toResponse();
	}

	// Handle other known error types
	if (error instanceof Error) {
		return {
			code: ErrorCode.INTERNAL_ERROR,
			message: "An unexpected error occurred",
			status: 500,
		};
	}

	// Unknown error type
	return {
		code: ErrorCode.INTERNAL_ERROR,
		message: "An unexpected error occurred",
		status: 500,
	};
}
