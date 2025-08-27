export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: '24h',
    algorithm: 'HS256' as const,
    refreshExpiresIn: '7d',
    issuer: 'mango-app',
    audience: 'mango-app-users',
  },
  cookies: {
    authToken: 'auth-token',
    refreshToken: 'refresh-token',
    userSession: 'user-session',
  },
  security: {
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
  routes: {
    public: [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/health"
    ],
    protected: [
      "/api/auth/me",
      "/api/profile",
      "/api/user",
      "/api/logout"
    ]
  }
} as const;

export function validateAuthConfig(): void {
  if (!authConfig.jwt.secret) {
    throw new Error('JWT secret is not defined in environment variables.');
  }

  if (authConfig.jwt.secret.length < 32) {
    throw new Error('JWT secret is too short. It should be at least 32 characters long for security.');
  }
}