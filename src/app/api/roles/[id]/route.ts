import { roleController } from '@/lib/controllers/RoleController';
import { createRoleResourceHandler } from '@/lib/utils/apiHandlers';

export const GET = createRoleResourceHandler('READ', async (roleId) => {
  return await roleController.getById(roleId);
});

export const PUT = createRoleResourceHandler('UPDATE', async (roleId, request, checker) => {
  const data = await request.json();
  
  // Example: Dynamic permission validation for role updates
  if (data.permissions && data.permissions.includes('system:admin')) {
    if (!checker.hasPermission('system:superadmin')) {
      throw new Error('Only super admins can assign system admin permissions');
    }
  }
  
  // Validate permission limit
  if (data.permissions && data.permissions.length > 50) {
    throw new Error('Too many permissions assigned to a single role');
  }
  
  return await roleController.update(roleId, data);
});

export const DELETE = createRoleResourceHandler('DELETE', async (roleId, request, checker) => {
  if (roleId === 1) { // Assuming ID 1 is a system admin role
    if (!checker.hasPermission('system:admin')) {
      throw new Error('Cannot delete system roles without system admin permission');
    }
  }
  
  return await roleController.delete(roleId);
});
