import { roleController } from '@/lib/controllers/RoleController';
import { BaseRoute, handleApiResponse } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { protectRoute } from '@/lib/auth/unified';
import { userController } from '@/lib/controllers/UserController';

export const GET = protectRoute(async (request, { user, params }) => {
  const roleId = Number(params.id);
  
  if (isNaN(roleId) || roleId <= 0) {
    return BaseRoute.errorResponse('Invalid role ID', 400);
  }
  
  // Check if the requester is a super-admin
  const isSuperAdmin = await userController.isSuperAdmin(user!.id);
  
  const result = await roleController.getRoleWithPermissions(roleId, { isSuperAdmin });
  return handleApiResponse(result, user?.email);
});

export const POST = protectRoute(async (request, { user, params }) => {
  const roleId = Number(params.id);
  
  if (isNaN(roleId) || roleId <= 0) {
    return BaseRoute.errorResponse('Invalid role ID', 400);
  }

  const {permissionIds} = await request.json();
  if (!Array.isArray(permissionIds) || permissionIds.some(id => typeof id !== 'number' || id <= 0)) {
    return BaseRoute.errorResponse('permissionIds must be an array of positive numbers', 400);
  }

  const result = await roleController.assignPermissionsToRole(roleId, permissionIds);
  return handleApiResponse(result, user?.email);
});

export const PUT = protectRoute(async (request, { user, params }) => {
  const roleId = Number(params.id);
  
  if (isNaN(roleId) || roleId <= 0) {
    return BaseRoute.errorResponse('Invalid role ID', 400);
  }

  const {permissionIds} = await request.json();
  if (!Array.isArray(permissionIds) || permissionIds.some(id => typeof id !== 'number' || id <= 0)) {
    return BaseRoute.errorResponse('permissionIds must be an array of positive numbers', 400);
  }

  const result = await roleController.updatePermissionsForRole(roleId, permissionIds);
  return handleApiResponse(result, user?.email);
});

export const DELETE = protectRoute(async (request, { user, params }) => {
  const roleId = Number(params.id);
  
  if (isNaN(roleId) || roleId <= 0) {
    return BaseRoute.errorResponse('Invalid role ID', 400);
  }

  const {permissionIds} = await request.json();
  if (!Array.isArray(permissionIds) || permissionIds.some(id => typeof id !== 'number' || id <= 0)) {
    return BaseRoute.errorResponse('permissionIds must be an array of positive numbers', 400);
  }

  const result = await roleController.removePermissionsFromRole(roleId, permissionIds);
  return handleApiResponse(result, user?.email);
});