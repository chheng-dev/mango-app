import { NextRequest } from 'next/server';
import { BaseRoute, handleApiResponse } from '@/lib/utils/BaseRoute';
import { PermissionChecker } from '@/lib/utils/permissions';
import { protectRoute } from '../auth/unified';

/**
 * Extract ID from URL path
 */
export function extractIdFromPath(request: NextRequest): { id: number; error?: any } {
  const url = new URL(request.url);
  const idString = url.pathname.split('/').pop();
  
  if (!idString || isNaN(Number(idString))) {
    return { 
      id: 0, 
      error: BaseRoute.errorResponse('Invalid resource ID', 400) 
    };
  }

  return { id: Number(idString) };
}

/**
 * Create a simple resource handler with permission checking
 */
export function createResourceHandler<T = any>(
  requiredPermission: string,
  handler: (resourceId: number, request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  return protectRoute(async (request: NextRequest, { user }) => {
    // Extract ID from path
    const { id: resourceId, error } = extractIdFromPath(request);
    if (error) return error;

    // Create permission checker
    const checker = new PermissionChecker(user as any);

    // Check permission
    if (!checker.hasPermission(requiredPermission)) {
      return BaseRoute.errorResponse(`Missing ${requiredPermission} permission`, 403);
    }

    try {
      // Execute the actual business logic
      const result = await handler(resourceId, request, checker);
      return handleApiResponse(result, user?.email);
    } catch (error) {
      console.error(`Error in resource operation:`, error);
      return BaseRoute.errorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      );
    }
  });
}

/**
 * Create a simple list handler with permission checking
 */
export function createListHandler<T = any>(
  requiredPermission: string,
  handler: (request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  return protectRoute(async (request: NextRequest, { user }) => {
    // Create permission checker
    const checker = new PermissionChecker(user as any);

    // Check permission
    if (!checker.hasPermission(requiredPermission)) {
      return BaseRoute.errorResponse(`Missing ${requiredPermission} permission`, 403);
    }

    try {
      // Execute the actual business logic
      const result = await handler(request, checker);
      return handleApiResponse(result, user?.email);
    } catch (error) {
      console.error(`Error in list operation:`, error);
      return BaseRoute.errorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      );
    }
  });
}

/**
 * Convenience functions for specific resources
 */
export function createUserResourceHandler<T = any>(
  operation: 'READ' | 'UPDATE' | 'DELETE',
  handler: (userId: number, request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  const permissions = {
    READ: 'user:read',
    UPDATE: 'user:update', 
    DELETE: 'user:delete'
  };
  return createResourceHandler(permissions[operation], handler);
}

export function createUserListHandler<T = any>(
  operation: 'READ' | 'CREATE',
  handler: (request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  const permissions = {
    READ: 'user:read',
    CREATE: 'user:create'
  };
  return createListHandler(permissions[operation], handler);
}

export function createRoleResourceHandler<T = any>(
  operation: 'READ' | 'UPDATE' | 'DELETE',
  handler: (roleId: number, request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  const permissions = {
    READ: 'role:read',
    UPDATE: 'role:update',
    DELETE: 'role:delete'
  };
  return createResourceHandler(permissions[operation], handler);
}

export function createRoleListHandler<T = any>(
  operation: 'READ' | 'CREATE',
  handler: (request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  const permissions = {
    READ: 'role:read',
    CREATE: 'role:create'
  };
  return createListHandler(permissions[operation], handler);
}

export function createPermissionResourceHandler<T = any>(
  operation: 'READ' | 'UPDATE' | 'DELETE',
  handler: (permissionId: number, request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  const permissions = {
    READ: 'permission:read',
    UPDATE: 'permission:update',
    DELETE: 'permission:delete'
  };
  return createResourceHandler(permissions[operation], handler);
}

export function createPermissionListHandler<T = any>(
  operation: 'READ' | 'CREATE',
  handler: (request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  const permissions = {
    READ: 'permission:read',
    CREATE: 'permission:create'
  };
  return createListHandler(permissions[operation], handler);
}

export function createContactPersonResourceHandler<T = any>(
  operation: 'READ' | 'UPDATE' | 'DELETE',
  handler: (contactId: number, request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  const permissions = {
    READ: 'contact-person:read',
    UPDATE: 'contact-person:update',
    DELETE: 'contact-person:delete'
  };
  return createResourceHandler(permissions[operation], handler);
}

export function createContactPersonListHandler<T = any>(
  operation: 'READ' | 'CREATE',
  handler: (request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  const permissions = {
    READ: 'contact-person:read',
    CREATE: 'contact-person:create'
  };
  return createListHandler(permissions[operation], handler);
}
