import { NextRequest, NextResponse } from 'next/server';
import { roleController } from '@/lib/controllers/RoleController';
import { BaseRoute, withErrorHandling } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

// GET /api/rbac/roles/{id}/permissions - Get role permissions
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return BaseRoute.handleAuthenticatedGetById(
    request,
    params,
    async (roleId: number, auth?) => {
      return await roleController.getRoleWithPermissions(roleId);
    },
    'Role Permissions',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_READ]
    }
  );
}, 'GET Role Permissions');

// POST /api/rbac/roles/{id}/permissions - Assign permissions to role
export const POST = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // Authenticate request
    const authResult = await BaseRoute.authenticateRequest(request, {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_UPDATE]
    });

    if (!authResult.success) {
      return authResult.response || BaseRoute.errorResponse('Authentication failed', 401);
    }

    const { id } = await params;
    const roleId = parseInt(id);
    
    if (isNaN(roleId)) {
      return BaseRoute.errorResponse('Invalid role ID', 400);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return BaseRoute.errorResponse('Invalid JSON in request body', 400);
    }

    const { permissionIds } = body;

    if (!Array.isArray(permissionIds)) {
      return BaseRoute.errorResponse('permissionIds must be an array', 400);
    }

    // Validate permission IDs
    const validPermissionIds = permissionIds.filter(id => 
      typeof id === 'number' && id > 0
    );

    if (validPermissionIds.length !== permissionIds.length) {
      return BaseRoute.errorResponse('All permission IDs must be positive numbers', 400);
    }

    const result = await roleController.assignPermissionsToRole(roleId, validPermissionIds);
    
    return BaseRoute.successResponse(result, {
      successStatus: 200,
      errorStatus: 400
    });
  } catch (error) {
    console.error('POST Role Permissions error:', error);
    return BaseRoute.errorResponse('Internal server error', 500);
  }
}, 'POST Role Permissions');

// PUT /api/rbac/roles/{id}/permissions - Update role permissions (replace all)
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // Authenticate request
    const authResult = await BaseRoute.authenticateRequest(request, {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_UPDATE]
    });

    if (!authResult.success) {
      return authResult.response || BaseRoute.errorResponse('Authentication failed', 401);
    }

    const { id } = await params;
    const roleId = parseInt(id);
    
    if (isNaN(roleId)) {
      return BaseRoute.errorResponse('Invalid role ID', 400);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return BaseRoute.errorResponse('Invalid JSON in request body', 400);
    }

    const { permissionIds } = body;

    if (!Array.isArray(permissionIds)) {
      return BaseRoute.errorResponse('permissionIds must be an array', 400);
    }

    // Validate permission IDs
    const validPermissionIds = permissionIds.filter(id => 
      typeof id === 'number' && id > 0
    );

    if (validPermissionIds.length !== permissionIds.length) {
      return BaseRoute.errorResponse('All permission IDs must be positive numbers', 400);
    }

    // Replace all current permissions with the new set
    const result = await roleController.replacePermissionsForRole(roleId, validPermissionIds);
    
    return BaseRoute.successResponse(result, {
      successStatus: 200,
      errorStatus: 400
    });
  } catch (error) {
    console.error('PUT Role Permissions error:', error);
    return BaseRoute.errorResponse('Internal server error', 500);
  }
}, 'PUT Role Permissions');

// DELETE /api/rbac/roles/{id}/permissions - Remove permissions from role
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // Authenticate request
    const authResult = await BaseRoute.authenticateRequest(request, {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_UPDATE]
    });

    if (!authResult.success) {
      return authResult.response || BaseRoute.errorResponse('Authentication failed', 401);
    }

    const { id } = await params;
    const roleId = parseInt(id);
    
    if (isNaN(roleId)) {
      return BaseRoute.errorResponse('Invalid role ID', 400);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return BaseRoute.errorResponse('Invalid JSON in request body', 400);
    }

    const { permissionIds } = body;

    if (!Array.isArray(permissionIds)) {
      return BaseRoute.errorResponse('permissionIds must be an array', 400);
    }

    // Validate permission IDs
    const validPermissionIds = permissionIds.filter(id => 
      typeof id === 'number' && id > 0
    );

    if (validPermissionIds.length !== permissionIds.length) {
      return BaseRoute.errorResponse('All permission IDs must be positive numbers', 400);
    }

    const result = await roleController.removePermissionsFromRole(roleId, validPermissionIds);
    
    return BaseRoute.successResponse(result, {
      successStatus: 200,
      errorStatus: 400
    });
  } catch (error) {
    console.error('DELETE Role Permissions error:', error);
    return BaseRoute.errorResponse('Internal server error', 500);
  }
}, 'DELETE Role Permissions');
