import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
	const { searchParams } = new URL(req.url);
	const redirectPath = searchParams.get("redirectPath") ?? "/";

	return NextResponse.redirect(new URL(redirectPath, req.url));
};
