import { updateSession } from "@proxed/supabase/middleware";
import { createI18nMiddleware } from "next-international/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "proxed.ai";

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
	// Enforce apex domain in production: redirect www.proxed.ai -> proxed.ai
	const host = request.headers.get("host");
	if (
		process.env.NODE_ENV === "production" &&
		host === `www.${ROOT_DOMAIN}`
	) {
		const url = new URL(request.url);
		url.host = ROOT_DOMAIN;
		url.protocol = "https:";
		return NextResponse.redirect(url, 308);
	}

	const { response, user } = await updateSession(
		request as any,
		I18nMiddleware(request as any),
	);

	const { pathname } = request.nextUrl;

	if (isPublicPath(pathname)) {
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
