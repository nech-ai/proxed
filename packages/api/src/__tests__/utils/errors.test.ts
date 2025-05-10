import { describe, test, expect } from "bun:test";
import {
	createError,
	AppError,
	ErrorCode,
	errorMap,
	handleApiError,
	type ApiError,
} from "../../utils/errors";

describe("Error Utilities", () => {
	describe("createError", () => {
		test("should create an AppError instance with correct code, status, and default message", () => {
			const code = ErrorCode.BAD_REQUEST;
			const error = createError(code);
			expect(error).toBeInstanceOf(AppError);
			expect(error.code).toBe(code);
			expect(error.status).toBe(errorMap[code].status);
			expect(error.message).toBe(errorMap[code].message);
			expect(error.details).toBeUndefined();
		});

		test("should use the provided message instead of the default", () => {
			const code = ErrorCode.UNAUTHORIZED;
			const customMessage = "You shall not pass!";
			const error = createError(code, customMessage);
			expect(error.message).toBe(customMessage);
			expect(error.status).toBe(errorMap[code].status);
		});

		test("should include details if provided", () => {
			const code = ErrorCode.VALIDATION_ERROR;
			const details = { field: "email", issue: "Invalid format" };
			const error = createError(code, undefined, details);
			expect(error.details).toEqual(details);
		});
	});

	describe("AppError.toResponse", () => {
		test("should return a valid ApiError object", () => {
			const code = ErrorCode.NOT_FOUND;
			const message = "Resource not found here.";
			const details = { id: "123" };
			const appError = new AppError(
				code,
				message,
				errorMap[code].status,
				details,
			);
			const apiErrorResponse = appError.toResponse();

			expect(apiErrorResponse).toEqual({
				code,
				message,
				details,
				status: errorMap[code].status,
			});
		});
	});

	describe("handleApiError", () => {
		test("should return AppError's response if error is AppError", () => {
			const appError = createError(ErrorCode.FORBIDDEN, "Access denied");
			const expectedResponse = appError.toResponse();
			const actualResponse = handleApiError(appError);
			expect(actualResponse).toEqual(expectedResponse);
		});

		test("should return generic INTERNAL_ERROR for standard Error instances", () => {
			const genericError = new Error("Something went wrong");
			const actualResponse = handleApiError(genericError);
			expect(actualResponse).toEqual({
				code: ErrorCode.INTERNAL_ERROR,
				message: "An unexpected error occurred", // Default message for INTERNAL_ERROR from handleApiError
				status: 500,
			});
		});

		test("should return generic INTERNAL_ERROR for unknown error types", () => {
			const unknownError = { some: "weird error object" };
			const actualResponse = handleApiError(unknownError);
			expect(actualResponse).toEqual({
				code: ErrorCode.INTERNAL_ERROR,
				message: "An unexpected error occurred",
				status: 500,
			});
		});
	});
});
