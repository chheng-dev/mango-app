import { NextRequest, NextResponse } from 'next/server';
import { BaseRoute, withErrorHandling } from '@/lib/utils/BaseRoute';

/**
 * Token verification and user profile API
 */

// GET /api/auth/me - Get current user profile from token
export const GET = withErrorHandling(async (request: NextRequest) => {
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

    return NextResponse.json({  
      success: true,
      data: authResult.auth?.user,
      message: 'User profile retrieved successfully'
    });
    
  } catch (error) { 
    console.error('Get user profile error:', error);
    return BaseRoute.errorResponse('Failed to get user profile', 500);
  }
}, 'GET User Profile');
