import { roleController } from '@/lib/controllers/RoleController';
import { handleApiResponse } from '@/lib/utils/BaseRoute';
import { protectRoute } from '@/lib/auth/unified';

export const GET = protectRoute(async (request, { user, params }) => {
  const roleId = parseInt(params.id);
  const result = await roleController.getById(roleId);
  return handleApiResponse(result, user?.email);
});

export const PUT = protectRoute(async (request, { user, params }) => {
  const roleId = parseInt(params.id);
  const data = await request.json();
  
  if (data.permissions && data.permissions.includes('system:admin')) {
    const hasSuperAdminRole = user?.roles?.includes('super-admin');
    if (!hasSuperAdminRole) {
      throw new Error('Only super admins can assign system admin permissions');
    }
  }
  
  if (data.permissions && data.permissions.length > 50) {
    throw new Error('Too many permissions assigned to a single role');
  }
  
  const result = await roleController.update(roleId, data);
  return handleApiResponse(result, user?.email);
});

export const DELETE = protectRoute(async (request, { user, params }) => {
  const roleId = parseInt(params.id);
  
  if (roleId === 1) {
    const hasSystemAdminPermission = user?.permissions?.includes('super-admin');
    if (!hasSystemAdminPermission) {
      throw new Error('Cannot delete system roles without system admin permission');
    }
  }
  
  const result = await roleController.delete(roleId);
  return handleApiResponse(result, user?.email);
});
