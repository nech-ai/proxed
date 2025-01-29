const handler = () => {
	return Response.json({ status: "ok", version: "1.0.0" });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
