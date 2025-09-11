import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { userController } from '@/lib/controllers/UserController';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user;

    if (!user || (!user.id && !user.userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user session'
        },
        { status: 401 }
      );
    }

    // Use userId from JWT token payload
    const userId = user.id || user.userId;
    const result = await userController.getCurrentUser(userId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Profile retrieved successfully'
      });
    }

    // Log the actual error for debugging
    console.error('Profile retrieval failed:', result.error);
    return NextResponse.json(result, { status: 400 });

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
    
    // Add validation for user object - check for both id and userId
    if (!user || (!user.id && !user.userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user session'
        },
        { status: 401 }
      );
    }

    // Use userId from JWT token payload
    const userId = user.id || user.userId;
    const body = await request.json();

    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { 
      id, 
      email, 
      passwordHash, 
      passwordConfirmation, 
      isActive, 
      isVerified, 
      createdAt, 
      updatedAt, 
      ...updateData 
    } = body;

    // Allow name and other safe profile fields to be updated
    const allowedFields = {
      name: body.name,
      code: body.code,
      ...updateData
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, value]) => value !== undefined)
    );

    // Use the clean service-based update method
    const result = await userController.update(userId, cleanedData);
    
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

    // Add validation for user object - check for both id and userId
    if (!user || (!user.id && !user.userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user session'
        },
        { status: 401 }
      );
    }

    // Use userId from JWT token payload
    const userId = user.id || user.userId;

    // Use the clean service-based updateStatus method
    const result = await userController.updateStatus(userId, false);
    
    if (result.success) {
      // Clear auth cookie on account deactivation
      const response = NextResponse.json({
        success: true,
        data: true,
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
