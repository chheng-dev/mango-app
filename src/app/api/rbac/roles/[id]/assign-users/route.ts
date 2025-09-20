import { roleController } from "@/lib/controllers/RoleController";
import { NextRequest, NextResponse } from "next/server";
import { BaseRoute, withErrorHandling } from "@/lib/utils/BaseRoute";
import { PERMISSIONS } from "@/lib/constants/permissions";

/**
 * Role User Assignment API Routes
 * GET /api/rbac/roles/[id]/assign-users - Get available users for role assignment
 * POST /api/rbac/roles/[id]/assign-users - Assign users to role
 * DELETE /api/rbac/roles/[id]/assign-users - Remove users from role
 */

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return BaseRoute.handleAuthenticatedGetCollection(
    request,
    async (queryParams, auth) => {
      const roleId = parseInt(params.id);
      if (isNaN(roleId)) {
        throw new Error('Invalid role ID');
      }

      const { searchParams } = new URL(request.url);
      const query = searchParams.get('search') || '';
      const excludeAssigned = searchParams.get('includeAssigned') !== 'true'; // Invert logic
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');

      return await roleController.getUsersForRoleAssignment(roleId, {
        query,
        excludeAssigned,
        page,
        limit
      });
    },
    'Role Users',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_READ, PERMISSIONS.USER_READ],
      allowSelf: false
    }
  );
}, 'GET Role Users');

export const POST = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return BaseRoute.handleAuthenticatedCreate(
    request,
    async (data, auth) => {
      const roleId = parseInt(params.id);
      if (isNaN(roleId)) {
        throw new Error('Invalid role ID');
      }

      const { userIds } = data;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('User IDs array is required');
      }

      // Validate user IDs
      const validUserIds = userIds.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
      if (validUserIds.length === 0) {
        throw new Error('No valid user IDs provided');
      }

      return await roleController.assignUsersToRole(roleId, validUserIds);
    },
    'Role User Assignment',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_UPDATE, PERMISSIONS.USER_UPDATE],
      allowSelf: false
    }
  );
}, 'POST Assign Users to Role');

export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // Authenticate request first
    const authResult = await BaseRoute.authenticateRequest(request, {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_UPDATE, PERMISSIONS.USER_UPDATE],
      allowSelf: false
    });

    if (!authResult.success) {
      return authResult.response || BaseRoute.errorResponse('Authentication failed', 401);
    }

    const roleId = parseInt(params.id);
    if (isNaN(roleId)) {
      return BaseRoute.errorResponse('Invalid role ID', 400);
    }

    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return BaseRoute.errorResponse('User IDs array is required', 400);
    }

    // Validate user IDs
    const validUserIds = userIds.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
    if (validUserIds.length === 0) {
      return BaseRoute.errorResponse('No valid user IDs provided', 400);
    }

    const result = await roleController.removeUsersFromRole(roleId, validUserIds);
    return BaseRoute.successResponse(result);
  } catch (error) {
    console.error('DELETE remove users from role error:', error);
    return BaseRoute.errorResponse('Internal server error', 500);
  }
}, 'DELETE Remove Users from Role');
