import { updateSession } from "@proxed/supabase/middleware";
import { createI18nMiddleware } from "next-international/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const I18nMiddleware = createI18nMiddleware({
	locales: ["en"],
	defaultLocale: "en",
	urlMappingStrategy: "rewrite",
});

const publicPaths = [
	"/login",
	"/signup",
	"/auth/token",
	"/auth/forgot-password",
];

function isPublicPath(path: string) {
	if (path.startsWith("/api/team/invitation/")) {
		return true;
	}
	return publicPaths.some((publicPath) => path.endsWith(publicPath));
}

export async function middleware(request: NextRequest) {
	const { response, user } = await updateSession(
		request,
		I18nMiddleware(request),
	);

	const { pathname } = request.nextUrl;

	if (isPublicPath(pathname)) {
		// Allow access to public paths regardless of auth status
		return response;
	}

	if (!user) {
		// Redirect to login if user is not authenticated and trying to access protected route
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return response;
}

export const config = {
	matcher: [
		"/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
