export interface JWTPayload {
  userId: number;
  email: string;
  code: string;
  isVerified: boolean;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  userId: number;
  email: string;
  code: string;
  isVerified: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

export interface AuthContext {
  user: {
    id: number;
    email: string;
    code: string;
    isVerified: boolean;
    roles?: string[];
    permissions?: string[];
  };
  token: string;
  isAuthenticated: boolean;
}