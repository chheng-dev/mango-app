import { NextRequest } from 'next/server';
import { jwtService } from '../auth/jwt';
import { AuthContext } from '../types/auth';
import { getUserPermissions, getUserRoles } from '../services/rbac-service';

/**
 * Permission constants for RBAC
 */
export const PERMISSIONS = {
  // User permissions
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Role permissions
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  
  // Permission permissions
  PERMISSIONS_READ: 'permissions:read',
  PERMISSIONS_CREATE: 'permissions:create',
  PERMISSIONS_UPDATE: 'permissions:update',
  PERMISSIONS_DELETE: 'permissions:delete',
  
  // Admin permissions
  ADMIN_READ: 'admin:read',
  ADMIN_WRITE: 'admin:write',
} as const;

/**
 * Authentication and authorization middleware
 */
export class AuthMiddleware {
  
  /**
   * Extract JWT token from request
   */
  static extractToken(request: NextRequest): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.replace('Bearer ', '');
    }
    
    // Try cookies
    const cookieToken = request.cookies.get('auth-token')?.value;
    if (cookieToken) {
      return cookieToken;
    }
    
    return null;
  }

  /**
   * Authenticate request and create user context
   */
  static async authenticate(request: NextRequest): Promise<{
    authenticated: boolean;
    context?: AuthContext;
    error?: { success: boolean; error: string };
  }> {
    try {
      const token = this.extractToken(request);
      
      if (!token) {
        return {
          authenticated: false,
          error: { success: false, error: 'No authentication token provided' }
        };
      }

      // Verify token
      const payload = jwtService.verifyAccessToken(token);
      
      // Fetch user roles and permissions from database
      const [userRoles, userPermissions] = await Promise.all([
        getUserRoles(payload.userId),
        getUserPermissions(payload.userId)
      ]);
      
      // Create auth context with dynamic permissions and roles
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

      return {
        authenticated: true,
        context
      };

    } catch (error) {
      console.error('Authentication error:', error);
      
      let errorMessage = 'Authentication failed';
      if (error instanceof Error) {
        if (error.message === 'ACCESS_TOKEN_EXPIRED') {
          errorMessage = 'Token has expired';
        } else if (error.message === 'INVALID_ACCESS_TOKEN') {
          errorMessage = 'Invalid token';
        }
      }

      return {
        authenticated: false,
        error: { success: false, error: errorMessage }
      };
    }
  }

  /**
   * Check if user has required permissions
   */
  static checkPermissions(
    context: AuthContext,
    requiredPermissions: string[],
    requireAll = false
  ): {
    authorized: boolean;
    error?: { success: boolean; error: string };
  } {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return { authorized: true };
    }

    const userPermissions = context.user.permissions || [];
    
    const hasPermissions = requireAll
      ? requiredPermissions.every(permission => userPermissions.includes(permission))
      : requiredPermissions.some(permission => userPermissions.includes(permission));

    if (!hasPermissions) {
      return {
        authorized: false,
        error: {
          success: false,
          error: `Missing required permissions: ${requiredPermissions.join(', ')}`
        }
      };
    }

    return { authorized: true };
  }

  /**
   * Check if user has required roles
   */
  static checkRoles(
    context: AuthContext,
    requiredRoles: string[],
    requireAll = false
  ): {
    authorized: boolean;
    error?: { success: boolean; error: string };
  } {
    if (!requiredRoles || requiredRoles.length === 0) {
      return { authorized: true };
    }

    const userRoles = context.user.roles || [];
    
    const hasRoles = requireAll
      ? requiredRoles.every(role => userRoles.includes(role))
      : requiredRoles.some(role => userRoles.includes(role));

    if (!hasRoles) {
      return {
        authorized: false,
        error: {
          success: false,
          error: `Missing required roles: ${requiredRoles.join(', ')}`
        }
      };
    }

    return { authorized: true };
  }

  /**
   * Get user context from authenticated request
   */
  static async getUserContext(request: NextRequest): Promise<AuthContext | null> {
    const authResult = await this.authenticate(request);
    return authResult.authenticated ? authResult.context || null : null;
  }

  /**
   * Check if user can access their own data
   */
  static canAccessSelf(context: AuthContext, resourceUserId: number): boolean {
    return context.user.id === resourceUserId;
  }

  /**
   * Refresh user permissions and roles (useful when permissions change)
   */
  static async refreshUserContext(context: AuthContext): Promise<AuthContext> {
    try {
      const [userRoles, userPermissions] = await Promise.all([
        getUserRoles(context.user.id),
        getUserPermissions(context.user.id)
      ]);

      return {
        ...context,
        user: {
          ...context.user,
          roles: userRoles,
          permissions: userPermissions
        }
      };
    } catch (error) {
      console.error('Error refreshing user context:', error);
      return context; // Return original context if refresh fails
    }
  }

  /**
   * Get fresh user context by user ID (useful for manual context creation)
   */
  static async getUserContextById(userId: number, token?: string): Promise<AuthContext | null> {
    try {
      const [userRoles, userPermissions] = await Promise.all([
        getUserRoles(userId),
        getUserPermissions(userId)
      ]);

      // Note: You might want to fetch user details from the database here
      // For now, we'll create a minimal context
      return {
        user: {
          id: userId,
          email: '', // Would need to fetch from user service
          code: '', // Would need to fetch from user service
          isVerified: false, // Would need to fetch from user service
          roles: userRoles,
          permissions: userPermissions
        },
        token: token || '',
        isAuthenticated: true
      };
    } catch (error) {
      console.error('Error getting user context by ID:', error);
      return null;
    }
  }

  /**
   * Quick permission check for a user ID (bypasses token validation)
   */
  static async hasUserPermission(userId: number, permission: string): Promise<boolean> {
    try {
      const userPermissions = await getUserPermissions(userId);
      return userPermissions.includes(permission);
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  /**
   * Quick role check for a user ID (bypasses token validation)
   */
  static async hasUserRole(userId: number, role: string): Promise<boolean> {
    try {
      const userRoles = await getUserRoles(userId);
      return userRoles.includes(role);
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(context: AuthContext, permissions: string[]): boolean {
    const userPermissions = context.user.permissions || [];
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(context: AuthContext, permissions: string[]): boolean {
    const userPermissions = context.user.permissions || [];
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(context: AuthContext, roles: string[]): boolean {
    const userRoles = context.user.roles || [];
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Check if user has all of the specified roles
   */
  static hasAllRoles(context: AuthContext, roles: string[]): boolean {
    const userRoles = context.user.roles || [];
    return roles.every(role => userRoles.includes(role));
  }
}
