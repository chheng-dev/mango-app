import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';

/**
 * Authentication Login API
 * POST /api/auth/login - User login with email/password
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required'
        },
        { status: 400 }
      );
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

    return NextResponse.json(result, { 
      status: result.success ? 200 : 401 
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}