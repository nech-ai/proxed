import { createError, ErrorCode } from "../../utils/errors";

export const proxyMethods = ["get", "post", "put", "patch", "delete"] as const;

export const getProxyPath = (path: string, projectId?: string) => {
	if (!projectId) {
		throw createError(
			ErrorCode.BAD_REQUEST,
			"Missing project id in request path.",
		);
	}
	const proxyPath = path.split(`/${projectId}/`)[1];
	if (!proxyPath) {
		throw createError(
			ErrorCode.BAD_REQUEST,
			"Missing upstream path. Expected /v1/{provider}/{projectId}/{provider-api-path}.",
		);
	}
	return proxyPath;
};

export type ProxyMethod = (typeof proxyMethods)[number];
