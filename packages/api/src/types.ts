export type AuthSession = {
	teamId: string;
	projectId: string;
	token?: string;
};

export interface AuthMiddlewareVariables {
	session: AuthSession;
}
