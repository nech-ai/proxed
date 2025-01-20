import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	try {
		return NextResponse.next();
	} catch (error) {
		Sentry.captureException(error);
		return NextResponse.json(
			{
				success: false,
				error: {
					message:
						process.env.NODE_ENV === "production"
							? "Internal Server Error"
							: error instanceof Error
								? error.message
								: "Unknown error",
					code: "INTERNAL_SERVER_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}

// Handle specific errors in middleware
export function handleError(error: unknown) {
	if (error instanceof Response) return error;
	Sentry.captureException(error);
	return NextResponse.json(
		{
			success: false,
			error: {
				message:
					process.env.NODE_ENV === "production"
						? "Internal Server Error"
						: error instanceof Error
							? error.message
							: "Unknown error",
				code: "INTERNAL_SERVER_ERROR",
			},
		},
		{ status: 500 },
	);
}

// Configure matcher if needed
export const config = {
	matcher: "/:path*",
};
