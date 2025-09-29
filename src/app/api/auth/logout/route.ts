import { NextRequest, NextResponse } from 'next/server';
import { BaseRoute, withErrorHandling } from '@/lib/utils/BaseRoute';

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully'
      },
      { status: 200 }
    );

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return BaseRoute.errorResponse('Logout failed', 500);
  }
}, 'POST Logout');

