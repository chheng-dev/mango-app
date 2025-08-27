import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { userController } from '@/lib/controllers/UserController';

/**
 * Protected user profile routes - requires authentication
 */

// GET /api/profile - Get current user's profile (protected)
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user;

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get profile'
      },
      { status: 500 }
    );
  }
});

// PUT /api/profile - Update current user's profile (protected)
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user;
    const body = await request.json();

    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { id, email, passwordHash, passwordConfirmation, isActive, isVerified, createdAt, updatedAt, ...updateData } = body;

    const result = await userController.update(user.id, updateData);
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update profile'
      },
      { status: 500 }
    );
  }
});

// DELETE /api/profile - Deactivate current user's account (protected)
export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user;

    const result = await userController.update(user.id, { isActive: false });
    
    if (result.success) {
      // Clear auth cookie on account deactivation
      const response = NextResponse.json({
        success: true,
        message: 'Account deactivated successfully'
      });

      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0
      });

      return response;
    }

    return NextResponse.json(result, { 
      status: 400 
    });

  } catch (error) {
    console.error('Deactivate account error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to deactivate account'
      },
      { status: 500 }
    );
  }
});
