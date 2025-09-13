import { AuthService } from './authService';
import { userService } from './UserService';
import { User } from '../db/schemas/users';
import { ApiResponse } from '../controllers/BaseController';

export type SafeUser = Omit<User, 'passwordHash' | 'passwordConfirmation'>;

export interface LoginResponse {
  user: SafeUser;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  passwordConfirmation: string;
  name: string;
  code: string;
}

export class AuthenticationService {
  /**
   * User login
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      // Validate input
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Find user
      const user = await userService.findByEmail(email);
      if (!user || !user.isActive) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Authenticate
      const isValid = await AuthService.authenticate(email, password, user.passwordHash);
      if (!isValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate token
      const token = await AuthService.generateToken(
        user.id,
        user.email,
        user.code,
        user.isVerified || false
      );

      // Remove sensitive fields
      const safeUser = this.removeSensitiveFields(user);

      return {
        success: true,
        data: { user: safeUser, token },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * User registration
   */
  async register(userData: RegisterData): Promise<ApiResponse<LoginResponse>> {
    try {
      // Validate required fields
      if (!userData.email || !userData.password || !userData.name || !userData.code) {
        return { success: false, error: 'All fields are required' };
      }

      // Validate password strength
      const passwordValidation = AuthService.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      // Check password confirmation
      if (userData.password !== userData.passwordConfirmation) {
        return { success: false, error: 'Passwords do not match' };
      }

      // Check if email exists
      const existingEmail = await userService.findByEmail(userData.email);
      if (existingEmail) {
        return { success: false, error: 'Email already exists' };
      }

      // Check if code exists
      const existingCode = await userService.findByCode(userData.code);
      if (existingCode) {
        return { success: false, error: 'User code already exists' };
      }

      // Hash password
      const hashedPassword = await AuthService.hashPassword(userData.password);

      // Create user
      const newUser = await userService.create({
        email: userData.email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        passwordConfirmation: hashedPassword,
        name: userData.name.trim(),
        code: userData.code.toUpperCase().trim(),
        isActive: true,
        isVerified: false
      });

      // Generate token
      const token = await AuthService.generateToken(
        newUser.id,
        newUser.email,
        newUser.code,
        newUser.isVerified || false
      );

      // Remove sensitive fields
      const safeUser = this.removeSensitiveFields(newUser);

      return {
        success: true,
        data: { user: safeUser, token },
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: number): Promise<ApiResponse<SafeUser>> {
    try {
      const updatedUser = await userService.update(userId, { isVerified: true });
      
      if (!updatedUser) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        data: this.removeSensitiveFields(updatedUser),
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Verify email error:', error);
      return { success: false, error: 'Failed to verify email' };
    }
  }

  /**
   * Update password
   */
  async updatePassword(
    userId: number, 
    newPassword: string, 
    passwordConfirmation: string
  ): Promise<ApiResponse<SafeUser>> {
    try {
      if (newPassword !== passwordConfirmation) {
        return { success: false, error: 'Password confirmation does not match' };
      }

      // Validate password strength
      const passwordValidation = AuthService.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }

      // Hash password
      const hashedPassword = await AuthService.hashPassword(newPassword);

      // Update user
      const updatedUser = await userService.update(userId, {
        passwordHash: hashedPassword,
        passwordConfirmation: hashedPassword
      });

      if (!updatedUser) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        data: this.removeSensitiveFields(updatedUser),
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: 'Failed to update password' };
    }
  }

  private removeSensitiveFields(user: User): SafeUser {
    const { passwordHash, passwordConfirmation, ...safeData } = user;
    return safeData;
  }
}

export const authenticationService = new AuthenticationService();
