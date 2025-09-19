import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';
import { BaseRoute, withErrorHandling } from '@/lib/utils/BaseRoute';

/**
 * Authentication Login API
 * POST /api/auth/login - User login with email/password
 */

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return BaseRoute.errorResponse('Email and password are required', 400);
    }

    // Use the clean service-based login method
    const result = await userController.login(email, password);

    if (result.success && result.data?.token) {
      // Set HTTP-only cookie for authentication
      const response = NextResponse.json(result, { status: 200 });
      response.cookies.set('auth-token', result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
      return response;
    }

    return BaseRoute.successResponse(result, {
      successStatus: result.success ? 200 : 401
    });

  } catch (error) {
    console.error('Login API error:', error);
    return BaseRoute.errorResponse('Internal server error', 500);
  }
}, 'POST Login');