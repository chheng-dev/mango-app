import { JWTPayload, TokenPair } from "../types/auth";
import { authConfig, validateAuthConfig } from "./config";
import jwt from 'jsonwebtoken';

export class JWTService {
  private static instance: JWTService;
  
  private constructor() {
    validateAuthConfig();
  }

  public static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }

  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(
      { 
        userId: payload.userId,
        email: payload.email,
        code: payload.code,
        isVerified: payload.isVerified
      },
      authConfig.jwt.secret,
      {
        expiresIn: authConfig.jwt.expiresIn,
        algorithm: authConfig.jwt.algorithm,
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
        subject: payload.userId.toString()
      }
    )
  }

  generateRefreshToken(userId: number): string {
    return jwt.sign(
      {
        userId,
        type: 'refresh'
      },
      authConfig.jwt.secret,
      {
        expiresIn: authConfig.jwt.refreshExpiresIn,
        algorithm: authConfig.jwt.algorithm,
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
        subject: userId.toString()
      }
    )
  }

  generateTokenPair(payload: JWTPayload): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload.userId);
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret, {
        algorithms: [authConfig.jwt.algorithm],
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
      }) as any;
      return decoded as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('ACCESS_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_ACCESS_TOKEN');
      }
      if (error instanceof jwt.NotBeforeError) {
        throw new Error('TOKEN_NOT_ACTIVE');
      }
      throw new Error('TOKEN_VERIFICATION_FAILED');

    }
  }

  verifyRefreshToken(token: string): { userId: number, type: string } {
    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret, {
        algorithms: [authConfig.jwt.algorithm],
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
      }) as any;

      if (decoded.type !== 'refresh') {
        throw new Error('INVALID_REFRESH_TOKEN');
      }

      return { 
        userId: decoded.userId, 
        type: decoded.type 
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_REFRESH_TOKEN');
      }
      if (error instanceof jwt.NotBeforeError) {
        throw new Error('TOKEN_NOT_ACTIVE');
      }
      throw new Error('TOKEN_VERIFICATION_FAILED');
    }
  }

  decodeToken(token: string): any {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getTokenPayload(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error('Error getting token payload:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      jwt.verify(token, authConfig.jwt.secret);
      return false;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return true;
      }
      return false;
    }
  }

  getTokenExpirationTime(token: string): Date | null {
    const payload = this.getTokenPayload(token);
    return payload?.exp ? new Date(payload.exp * 1000) : null;
  }

  refreshAccessToken(refreshToken: string, userPayload: JWTPayload): string {
    const refreshPayload = this.verifyRefreshToken(refreshToken);

    if (refreshPayload.userId !== userPayload.userId) {
      throw new Error('TOKEN_USER_MISMATCH');
    }

    return this.generateAccessToken(userPayload);
  }

  private blacklistedTokens = new Set<string>();

  blacklistToken(token: string): void {
    this.blacklistedTokens.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
}

// Export singleton instance
export const jwtService = JWTService.getInstance();

