export interface RegisterDTO {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface LoginSessionContext {
  userAgent?: string;
  ipAddress?: string;
}
