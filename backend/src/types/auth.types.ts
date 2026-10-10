export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}
