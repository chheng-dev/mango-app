import { NextRequest, NextResponse } from 'next/server';
import { jwtService } from './jwt';
import { HTTP_STATUS } from '../utils/BaseRoute';
import { userController } from '../controllers/UserController';

/**
 * Unified Authentication System
 * Replaces all the messy auth files with one clean system
 */

export interface AuthUser {
  id: number;
  email: string;
  code: string;
  isVerified: boolean;
  roles: string[];
  permissions: string[];
}

export interface AuthContext {
  params?: any;
  user: AuthUser;
  token: string;
  isAuthenticated: true;
}

export interface AuthOptions {
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAllPermissions?: boolean;
  requireAllRoles?: boolean;
}

/**
 * Extract JWT token from request
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '');
  }
  
  // Try cookies
  return request.cookies.get('auth-token')?.value || null;
}

/**
 * Authenticate user and fetch fresh permissions from database
 */
export async function authenticateUser(request: NextRequest): Promise<{
  success: boolean;
  context?: AuthContext;
  error?: string;
}> {
  try {
    const token = extractToken(request);
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token provided'
      };
    }

    // Verify JWT token
    const payload = jwtService.verifyAccessToken(token);
    
    if (!payload || !payload.userId) {
      return {
        success: false,
        error: 'Invalid token - no user data'
      };
    }

    console.log(`Token verification successful for user: ${payload.email || payload.userId}`);
    
    // Fetch fresh permissions and roles from database (DYNAMIC!)
    const [userRoles, userPermissions] = await Promise.all([
      userController.getUserRoles(payload.userId),
      userController.getUserPermissions(payload.userId)
    ]);
    
    const context: AuthContext = {
      user: {
        id: payload.userId,
        email: payload.email,
        code: payload.code,
        isVerified: payload.isVerified,
        roles: userRoles,
        permissions: userPermissions
      },
      token,
      isAuthenticated: true
    };

    return { success: true, context };

  } catch (error) {
    console.error('Authentication error:', error);
    
    let errorMessage = 'Authentication failed';
    if (error instanceof Error) {
      if (error.message === 'ACCESS_TOKEN_EXPIRED' || error.message.includes('expired')) {
        errorMessage = 'Token has expired';
      } else if (error.message === 'INVALID_ACCESS_TOKEN' || error.message.includes('Invalid')) {
        errorMessage = 'Invalid token';
      } else if (error.message.includes('token')) {
        errorMessage = error.message;
      }
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Check if user has required permissions (fresh from database)
 */
export async function checkPermissions(
  userId: number,
  requiredPermissions: string[],
  requireAll = false
): Promise<{ authorized: boolean; error?: string }> {
  if (!requiredPermissions?.length) {
    return { authorized: true };
  }

  try {
    const userPermissions = await userController.getUserPermissions(userId);
    
    const hasPermissions = requireAll
      ? requiredPermissions.every(permission => userPermissions.includes(permission))
      : requiredPermissions.some(permission => userPermissions.includes(permission));

    if (!hasPermissions) {
      return {
        authorized: false,
        error: `Missing required permissions: ${requiredPermissions.join(', ')}`
      };
    }

    return { authorized: true };
  } catch (error) {
    console.error('Error checking permissions:', error);
    return {
      authorized: false,
      error: 'Failed to verify permissions'
    };
  }
}

/**
 * Check if user has required roles (fresh from database)
 */
export async function checkRoles(
  userId: number,
  requiredRoles: string[],
  requireAll = false
): Promise<{ authorized: boolean; error?: string }> {
  if (!requiredRoles?.length) {
    return { authorized: true };
  }

  try {
    const userRoles = await userController.getUserRoles(userId);
    const hasRoles = requireAll
      ? requiredRoles.every(role => userRoles.includes(role))
      : requiredRoles.some(role => userRoles.includes(role));

    if (!hasRoles) {
      return {
        authorized: false,
        error: `Missing required roles: ${requiredRoles.join(', ')}`
      };
    }

    return { authorized: true };
  } catch (error) {
    console.error('Error checking roles:', error);
    return {
      authorized: false,
      error: 'Failed to verify roles'
    };
  }
}

/**
 * Create API response
 */
export function createApiResponse(
  data: any,
  userEmail?: string,
  status: number = HTTP_STATUS.OK
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      user: userEmail
    }
  }, { status });
}

/**
 * Create error response
 */
export function createErrorResponse(
  message: string,
  status: number = HTTP_STATUS.BAD_REQUEST
): NextResponse {
  return NextResponse.json({
    success: false,
    error: message
  }, { status });
}

/**
 * Main function to protect API routes with authentication and authorization
 * Updated to handle Next.js 15 params
 */
export function protectRoute(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async (
    request: NextRequest,
    routeContext?: { params: Promise<any> }
  ): Promise<NextResponse> => {
    try {
      // Authenticate user
      const authResult = await authenticateUser(request);
      
      if (!authResult.success || !authResult.context) {
        console.error(`Authentication failed: ${authResult.error}`);
        return createErrorResponse(
          authResult.error || 'Authentication required',
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const context = authResult.context;

      // Validate user data
      if (!context.user || !context.user.id) {
        console.error('Invalid token - no user data');
        return createErrorResponse(
          'Invalid token - no user data',
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      // Resolve params if they exist and add to context
      if (routeContext?.params) {
        const resolvedParams = await routeContext.params;
        context.params = resolvedParams;
      }

      // Check permissions (from database - DYNAMIC!)
      if (options.requiredPermissions?.length) {
        const permissionCheck = await checkPermissions(
          context.user.id,
          options.requiredPermissions,
          options.requireAllPermissions
        );

        if (!permissionCheck.authorized) {
          console.error(`Permission denied for user ${context.user.email}: ${permissionCheck.error}`);
          return createErrorResponse(
            permissionCheck.error || 'Insufficient permissions',
            HTTP_STATUS.FORBIDDEN
          );
        }
      }

      // Check roles (from database - DYNAMIC!)
      if (options.requiredRoles?.length) {
        const roleCheck = await checkRoles(
          context.user.id,
          options.requiredRoles,
          options.requireAllRoles
        );

        if (!roleCheck.authorized) {
          console.error(`Role check failed for user ${context.user.email}: ${roleCheck.error}`);
          return createErrorResponse(
            roleCheck.error || 'Insufficient roles',
            HTTP_STATUS.FORBIDDEN
          );
        }
      }

      // Execute the handler
      return await handler(request, context);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`${request.method} ${request.url} error:`, errorMessage);

      // Check if it's an auth-related error
      if (
        errorMessage.includes('token') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('Invalid') ||
        errorMessage.includes('expired')
      ) {
        return createErrorResponse(
          errorMessage,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      return createErrorResponse(
        'Internal server error',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  };
}
