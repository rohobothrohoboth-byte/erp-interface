export type UUID = string;
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    statusCode: number;
    traceId: string | null;
    timestamp: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    expiresDate: string;
}

export interface JwtPayload {
  userId: string;
  userName: string;
  employeeId: UUID;
  role: string;
  perModule: string[];
  perMenu: string[];
  perApi: string[];
  permissions: string;
  exp: number;
  iss: string;
  aud: string;
}
