import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';
import { AuthService } from '../services/authService';

/**
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

    const result = await AuthService.verifyToken(token);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Authentication failed'
      };
    }

    return {
      success: true,
      user: result.data
    };

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
