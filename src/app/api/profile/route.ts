import { NextRequest, NextResponse } from 'next/server';
import { BaseRoute, withErrorHandling } from '@/lib/utils/BaseRoute';
import { userController } from '@/lib/controllers/UserController';

export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const authResult = await BaseRoute.authenticateRequest(request, {
      requireAuth: true,
      requiredPermissions: [],
      allowSelf: false
    });

    if (!authResult.success) {
      return authResult.response || BaseRoute.errorResponse('Authentication failed', 401);
    }

    const user = authResult.auth?.user;
    if (!user || !user.id) {
      return BaseRoute.errorResponse('Invalid user session', 401);
    }

    const userId = user.id;
    const result = await userController.getCurrentUser(userId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Profile retrieved successfully'
      });
    }

    console.error('Profile retrieval failed:', result.error);
    return BaseRoute.successResponse(result, { successStatus: 400 });

  } catch (error) {
    console.error('Get profile error:', error);
    return BaseRoute.errorResponse('Failed to get profile', 500);
  }
}, 'GET Profile');

export const PUT = withErrorHandling(async (request: NextRequest) => {
  try {
    // Authenticate request
    const authResult = await BaseRoute.authenticateRequest(request, {
      requireAuth: true,
      requiredPermissions: [],
      allowSelf: false
    });

    if (!authResult.success) {
      return authResult.response || BaseRoute.errorResponse('Authentication failed', 401);
    }

    const user = authResult.auth?.user;
    if (!user || !user.id) {
      return BaseRoute.errorResponse('Invalid user session', 401);
    }

    // Use userId from auth context
    const userId = user.id;
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
    
    return BaseRoute.successResponse(result, {
      successStatus: result.success ? 200 : 400
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return BaseRoute.errorResponse('Failed to update profile', 500);
  }
}, 'PUT Profile');

// DELETE /api/profile - Deactivate current user's account (protected)
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  try {
    // Authenticate request
    const authResult = await BaseRoute.authenticateRequest(request, {
      requireAuth: true,
      requiredPermissions: [],
      allowSelf: false
    });

    if (!authResult.success) {
      return authResult.response || BaseRoute.errorResponse('Authentication failed', 401);
    }

    const user = authResult.auth?.user;
    if (!user || !user.id) {
      return BaseRoute.errorResponse('Invalid user session', 401);
    }

    // Use userId from auth context
    const userId = user.id;

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

    return BaseRoute.successResponse(result, { successStatus: 400 });

  } catch (error) {
    console.error('Deactivate account error:', error);
    return BaseRoute.errorResponse('Failed to deactivate account', 500);
  }
}, 'DELETE Profile');
