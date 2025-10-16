/**
 * @deprecated This file is deprecated. Use src/lib/auth/unified.ts instead.
 * 
 * Migration guide: docs/AUTH_CLEANUP_GUIDE.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtService } from '../auth/jwt';

/**
 * @deprecated Use protectRoute from src/lib/auth/unified.ts instead
 * Authentication middleware utility
 */

export interface AuthenticatedRequest extends NextRequest {
  user?: any;
}

export async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    // Try to get token from Authorization header first
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If not in header, try to get from cookies
    if (!token) {
      token = request.cookies.get('auth-token')?.value;
    }

    if (!token) {
      return {
        success: false,
        error: 'No authentication token provided'
      };
    }

    try {
      const decoded = jwtService.verifyAccessToken(token);
      
      return {
        success: true,
        user: decoded
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }

  } catch (error) {
    console.error('Authentication middleware error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error
        },
        { status: 401 }
      );
    }

    // Add user to request object
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = auth.user;

    return handler(authenticatedRequest);
  };
}
