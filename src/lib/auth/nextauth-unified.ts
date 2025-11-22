import { NextRequest, NextResponse } from 'next/server';
import { userController } from '../controllers/UserController';
import { HTTP_STATUS } from '../utils/BaseRoute';

/**
 * JWT-based Authentication System (compatible with NextAuth interface)
 */

export interface NextAuthUser {
  id: number;
  email: string;
  name: string;
  role?: string;
  roles: string[];
  permissions: string[];
}

export interface NextAuthContext {
  params?: any;
  user: NextAuthUser;
  isAuthenticated: true;
}

export interface AuthOptions {
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAllPermissions?: boolean;
}

/**
 * Create error response
 */
function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({
    error: message,
    success: false
  }, { status });
}

/**
 * Authenticate user using custom JWT tokens - works with auth-token cookies
 */
export async function authenticateUserWithJWT(request: NextRequest): Promise<{
  success: boolean;
  context?: NextAuthContext;
  error?: string;
}> {
  try {
    // Use custom JWT authentication instead of NextAuth
    // Check for auth-token cookie (same as profile API)
    const authCookie = request.cookies.get('auth-token');
    const token = authCookie ? authCookie.value : null;

    if (!token) {
      console.log('NextAuth auth: No auth-token cookie found');
      return {
        success: false,
        error: 'No authentication token provided'
      };
    }

    // Verify custom JWT token using the same method as profile API
    const { jwtService } = await import('@/lib/auth/jwt');
    const decoded = jwtService.verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      console.log('NextAuth auth: Invalid token');
      return {
        success: false,
        error: 'Invalid authentication token'
      };
    }

    const userId = decoded.userId;

    // Get user data from database
    const userResult = await userController.getCurrentUser(userId);
    if (!userResult.success || !userResult.data) {
      console.log('NextAuth auth: User not found');
      return {
        success: false,
        error: 'User not found'
      };
    }

    const user = userResult.data;

    // Fetch fresh permissions and roles from database
    const [userRoles, userPermissions] = await Promise.all([
      userController.getUserRoles(userId),
      userController.getUserPermissions(userId)
    ]);

    const context: NextAuthContext = {
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: undefined, // Not using single role, using roles array instead
        roles: userRoles,
        permissions: userPermissions
      },
      isAuthenticated: true
    };

    console.log('NextAuth auth: Authentication successful for user:', userId);
    return { success: true, context };

  } catch (error) {
    console.error('Custom JWT authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Check if user has required permissions
 */
export async function checkPermissions(
  userPermissions: string[],
  requiredPermissions: string[] = [],
  requireAllPermissions = true
): Promise<boolean> {
  if (requiredPermissions.length === 0) return true;

  // Helper function to check if user has a permission or its manage equivalent
  const hasPermission = (requiredPerm: string) => {
    // Check for exact permission match
    if (userPermissions.includes(requiredPerm)) {
      return true;
    }

    // Check for manage permission (e.g., if requiring "user:read", also accept "user:manage")
    const [resource] = requiredPerm.split(':');
    const managePermission = `${resource}:manage`;
    return userPermissions.includes(managePermission);
  };

  if (requireAllPermissions) {
    return requiredPermissions.every(hasPermission);
  } else {
    return requiredPermissions.some(hasPermission);
  }
}

/**
 * Check if user has required roles
 */
export async function checkRoles(
  userRoles: string[],
  requiredRoles: string[] = []
): Promise<boolean> {
  if (requiredRoles.length === 0) return true;

  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Main function to protect API routes with JWT authentication
 */
export function protectRouteWithJWT(
  handler: (request: NextRequest, context: NextAuthContext) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async (
    request: NextRequest,
    routeContext?: { params: Promise<any> }
  ): Promise<NextResponse> => {
    try {
      // Authenticate user with custom JWT
      const authResult = await authenticateUserWithJWT(request);

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
        console.error('Invalid session - no user data');
        return createErrorResponse(
          'Invalid session - no user data',
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      // Check if user is super-admin - bypass all permission checks
      const isSuperAdmin = await userController.isSuperAdmin(context.user.id);
      if (isSuperAdmin) {
        // Handle Next.js 15 params resolution
        if (routeContext?.params) {
          context.params = await routeContext.params;
        }
        return await handler(request, context);
      }

      // Check role permissions if specified
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        const hasRequiredRoles = await checkRoles(context.user.roles, options.requiredRoles);
        if (!hasRequiredRoles) {
          console.error(`Access denied - missing required roles: ${options.requiredRoles.join(', ')}`);
          return createErrorResponse(
            'Insufficient role permissions',
            HTTP_STATUS.FORBIDDEN
          );
        }
      }

      // Check if user has any permissions at all (basic security check)
      const hasAnyPermissions = context.user.permissions && context.user.permissions.length > 0;

      // Check specific permissions if specified
      if (options.requiredPermissions && options.requiredPermissions.length > 0) {
        const hasPermissions = await checkPermissions(
          context.user.permissions,
          options.requiredPermissions,
          options.requireAllPermissions
        );

        if (!hasPermissions) {
          console.error(`Access denied - missing permissions: ${options.requiredPermissions.join(', ')}`);
          return createErrorResponse(
            'Insufficient permissions',
            HTTP_STATUS.FORBIDDEN
          );
        }
      }

      // Handle Next.js 15 params resolution
      if (routeContext?.params) {
        context.params = await routeContext.params;
      }

      // Call the actual handler
      return await handler(request, context);

    } catch (error) {
      console.error('Route protection error:', error);
      return createErrorResponse(
        'Internal server error',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  };
}

// Alias for backward compatibility - use protectRouteWithJWT for new code
export const protectRoute = protectRouteWithJWT;
