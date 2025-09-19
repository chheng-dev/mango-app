import { NextRequest, NextResponse } from 'next/server';
import { BaseRoute, withErrorHandling } from '@/lib/utils/BaseRoute';

/**
 * Logout API - Clear authentication token
 */

// POST /api/auth/logout - User logout
export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully'
      },
      { status: 200 }
    );

    // Clear the auth token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return BaseRoute.errorResponse('Logout failed', 500);
  }
}, 'POST Logout');
