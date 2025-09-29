import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';
import { BaseRoute, withErrorHandling, HTTP_STATUS } from '@/lib/utils/BaseRoute';
import { PasswordService } from '@/lib/services/passwordService';
import { jwtService } from '@/lib/auth/jwt';

/**
 * User Registration API
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { email, name, code, password, passwordConfirmation, dob, phoneNumber } = body;

  if (!email || !name || !password || !passwordConfirmation) {
    return BaseRoute.errorResponse(
      'Email, name, password, and password confirmation are required',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Check password match
  if (password !== passwordConfirmation) {
    return BaseRoute.errorResponse(
      'Password confirmation does not match',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Check if email already exists
  const existingUser = await userController.getByEmail(email);
  if (existingUser.success) {
    return BaseRoute.errorResponse('Email already exists', HTTP_STATUS.BAD_REQUEST);
  }

  // Validate password strength
  const strength = PasswordService.validateStrength(password);
  if (!strength.isValid) {
    return BaseRoute.errorResponse(strength.errors.join(', '), HTTP_STATUS.BAD_REQUEST);
  }

  const passwordHash = await PasswordService.hash(password);

  const userData = {
    email: email.toLowerCase(),
    name,
    code: code || `USER_${Date.now()}`,
    passwordHash,
    passwordConfirmation, 
    dob: dob ? new Date(dob) : null,
    phoneNumber: phoneNumber || null,
    isActive: true,
    isVerified: false
  };

  const result = await userController.create(userData);
  
  if (!result.success || !result.data) {
    return BaseRoute.errorResponse(result.error || 'Registration failed', HTTP_STATUS.BAD_REQUEST);
  }

  const user = result.data;
  
  // Generate token for automatic login
  const token = jwtService.generateAccessToken({
    userId: user.id,
    email: user.email,
    code: user.code,
    isVerified: user.isVerified ?? false
  });

  // Set token in HTTP-only cookie
  const response = NextResponse.json({
    success: true,
    data: { user, token },
    message: 'Registration successful and logged in'
  }, { status: HTTP_STATUS.CREATED });
  
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  return response;
}, 'POST Register');
