export const proxyMethods = ["get", "post", "put", "patch", "delete"] as const;

export type ProxyMethod = (typeof proxyMethods)[number];
