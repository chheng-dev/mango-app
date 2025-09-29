import { roleController } from '@/lib/controllers/RoleController';
import { BaseRoute, handleApiResponse, createProtectedRoute } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const GET = createProtectedRoute(async (request, { user, params }) => {
  const roleId = Number(params.id);
  
  if (isNaN(roleId) || roleId <= 0) {
    return BaseRoute.errorResponse('Invalid role ID', 400);
  }
  
  const result = await roleController.getRoleWithPermissions(roleId);
  return handleApiResponse(result, user?.email);
}, { requiredPermissions: [PERMISSIONS.ROLE_READ] });

export const POST = createProtectedRoute(async (request, { user, params }) => {
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
}, { requiredPermissions: [PERMISSIONS.ROLE_CREATE] });

export const PUT = createProtectedRoute(async (request, { user, params }) => {
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
}, { requiredPermissions: [PERMISSIONS.ROLE_UPDATE] });

export const DELETE = createProtectedRoute(async (request, { user, params }) => {
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
}, { requiredPermissions: [PERMISSIONS.ROLE_DELETE] });