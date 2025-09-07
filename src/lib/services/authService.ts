import { jwtService } from "../auth/jwt";
import { LoginRequest } from "../auth/validation";
import { ApiResponse } from "../controllers/BaseController";
import { userController } from "../controllers/UserController";
import { LoginResponse } from "../types/auth";
import { PasswordService } from './passwordService';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const result = await userController.login(credentials.email, credentials.password);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Login failed'
        };
      }

      const tokens = await jwtService.generateTokenPair({
        userId: result.data.user.id,
        email: result.data.user.email,
        code: result.data.user.code,
        isVerified: result.data.user.isVerified || false,
      });

      return {
        success: true,
        data: {
          user: result.data.user as any,
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('AuthService.login error:', error);
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  static async authenticate(email: string, password: string, hashedPassword: string): Promise<boolean> {
    return await PasswordService.compare(password, hashedPassword);
  }

  static async generateToken(userId: number, email: string, code: string, isVerified: boolean = false): Promise<string> {
    const tokens = await jwtService.generateTokenPair({
      userId,
      email,
      code,
      isVerified
    });
    return tokens.accessToken;
  }

  static async hashPassword(password: string): Promise<string> {
    return await PasswordService.hash(password);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    return PasswordService.validateStrength(password);
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<ApiResponse<any>> {
    try {
      const decoded = jwtService.verifyAccessToken(token);
      return {
        success: true,
        data: decoded
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token verification failed'
      };
    }
  }
}