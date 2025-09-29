import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';
import { BaseRoute } from '@/lib/utils/BaseRoute';
import { PasswordService } from '@/lib/services/passwordService';
import { jwtService } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return BaseRoute.errorResponse('Email and password are required', 400);
    }

    const userResult = await userController.getByEmail(email);
    if (!userResult.success || !userResult.data) {
      return BaseRoute.errorResponse('Invalid credentials', 401);
    }

    const user = userResult.data;
    
    if (!user.isActive || !user.passwordHash) {
      return BaseRoute.errorResponse('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await PasswordService.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return BaseRoute.errorResponse('Invalid credentials', 401);
    }

    // Generate token
    const token = jwtService.generateAccessToken({
      userId: user.id,
      email: user.email,
      code: user.code,
      isVerified: user.isVerified!
    });

    const result = {
      success: true,
      data: { user, token },
      message: 'Login successful'
    };

    const response = NextResponse.json(result, { status: 200 });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
    
    return response;

  } catch (error) {
    console.error('Login API error:', error);
    return BaseRoute.databaseErrorResponse(error, 'Login failed');
  }
}