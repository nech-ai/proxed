export interface AuthSession {
  teamId: string;
  projectId: string;
}

export interface AuthMiddlewareVariables {
  session: AuthSession;
}
