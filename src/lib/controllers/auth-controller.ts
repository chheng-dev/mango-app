import { userController } from "./UserController";
import { PasswordService } from "../services/passwordService";
import { jwtService } from "../auth/jwt";

export interface LoginResult {
  message: string;
  user: any;
  accessToken: string;
  refreshToken: string;
}

export class AuthController {
  static async login(email: string, password: string): Promise<LoginResult | null> {
    try {
      // Get user by email
      const userResult = await userController.getByEmail(email);
      if (!userResult.success || !userResult.data) {
        return null;
      }

      const user = userResult.data;

      // Check if user is active and has password
      if (!user.isActive || !user.passwordHash) {
        return null;
      }

      // Verify password
      const isValidPassword = await PasswordService.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return null;
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        code: user.code,
        isVerified: user.isVerified!
      };

      const accessToken = jwtService.generateAccessToken(tokenPayload);
      const refreshToken = jwtService.generateRefreshToken(user.id);

      return {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          code: user.code
        },
        accessToken,
        refreshToken
      };

    } catch (error) {
      console.error("AuthController login error:", error);
      return null;
    }
  }
}