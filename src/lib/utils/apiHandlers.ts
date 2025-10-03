import { NextRequest } from 'next/server';
import { BaseRoute, handleProtectedRoute, handleApiResponse } from '@/lib/utils/BaseRoute';
import { PermissionChecker, validateResourceAccess, ResourcePermissionConfig, USER_PERMISSIONS, ROLE_PERMISSIONS, PERMISSION_PERMISSIONS } from '@/lib/utils/permissions';

/**
 * Utility functions for API route handlers with better architecture
 */

/**
 * Extract and validate ID from URL path
 */
export function extractIdFromPath(request: NextRequest): { id: number; error?: any } {
  const url = new URL(request.url);
  const idString = url.pathname.split('/').pop();
  
  if (!idString || isNaN(Number(idString))) {
    return { 
      id: 0, 
      error: BaseRoute.errorResponse('Invalid user ID', 400) 
    };
  }

  return { id: Number(idString) };
}

/**
 * Create a resource handler with permission checking for any resource type
 */
export function createResourceHandler<T = any, C extends ResourcePermissionConfig = ResourcePermissionConfig>(
  resourceConfig: C,
  operation: keyof C,
  handler: (resourceId: number, request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  return handleProtectedRoute(async (request: NextRequest, { auth }) => {
    // Extract ID from path
    const { id: resourceId, error } = extractIdFromPath(request);
    if (error) return error;

    // Create permission checker
    const checker = new PermissionChecker(auth);
    
    // Validate access
    const accessResult = validateResourceAccess(checker, resourceConfig, operation, resourceId);
    if (!accessResult.allowed) {
      return BaseRoute.errorResponse(accessResult.reason || 'Access denied', 403);
    }

    try {
      // Execute the actual business logic
      const result = await handler(resourceId, request, checker);
      return handleApiResponse(result, auth.user?.email);
    } catch (error) {
      console.error(`Error in ${String(operation)} operation:`, error);
      return BaseRoute.errorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      );
    }
  });
}

/**
 * Create a user resource handler with permission checking (backward compatibility)
 */
export function createUserResourceHandler<T = any>(
  operation: keyof typeof USER_PERMISSIONS,
  handler: (userId: number, request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  return createResourceHandler(USER_PERMISSIONS, operation, handler);
}

/**
 * Create a list resource handler with permission checking for any resource type
 */
export function createListResourceHandler<T = any, C extends ResourcePermissionConfig = ResourcePermissionConfig>(
  resourceConfig: C,
  operation: keyof C,
  handler: (request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  return handleProtectedRoute(async (request: NextRequest, { auth }) => {
    // Create permission checker
    const checker = new PermissionChecker(auth);
    
    // Validate access (no target resource ID needed for list operations)
    const accessResult = validateResourceAccess(checker, resourceConfig, operation);
    if (!accessResult.allowed) {
      return BaseRoute.errorResponse(accessResult.reason || 'Access denied', 403);
    }

    try {
      // Execute the actual business logic
      const result = await handler(request, checker);
      return handleApiResponse(result, auth.user?.email);
    } catch (error) {
      console.error(`Error in ${String(operation)} operation:`, error);
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
export function createUserListHandler<T = any>(
  operation: keyof typeof USER_PERMISSIONS,
  handler: (request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  return createListResourceHandler(USER_PERMISSIONS, operation, handler);
}

export function createRoleResourceHandler<T = any>(
  operation: keyof typeof ROLE_PERMISSIONS,
  handler: (roleId: number, request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  return createResourceHandler(ROLE_PERMISSIONS, operation, handler);
}

export function createRoleListHandler<T = any>(
  operation: keyof typeof ROLE_PERMISSIONS,
  handler: (request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  return createListResourceHandler(ROLE_PERMISSIONS, operation, handler);
}

export function createPermissionResourceHandler<T = any>(
  operation: keyof typeof PERMISSION_PERMISSIONS,
  handler: (permissionId: number, request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  return createResourceHandler(PERMISSION_PERMISSIONS, operation, handler);
}

export function createPermissionListHandler<T = any>(
  operation: keyof typeof PERMISSION_PERMISSIONS,
  handler: (request: NextRequest, checker: PermissionChecker) => Promise<T>
) {
  return createListResourceHandler(PERMISSION_PERMISSIONS, operation, handler);
}
