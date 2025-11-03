import { protectRoute } from '@/lib/auth/unified';
import { userController } from '@/lib/controllers/UserController';
import { BaseRoute, handleApiResponse } from '@/lib/utils/BaseRoute';

export const GET = protectRoute(async (request, { user, params }) => {
  const userId = Number(params?.id);
  
  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  const permissions = await userController.getUserPermissions(userId);
  const roles = await userController.getUserRoles(userId);
  const userIsSuperAdmin = await userController.isSuperAdmin(userId);

  const result = {
    success: true,
    data: {
      userId,
      permissions,
      roles,
      permissionsCount: permissions.length,
      rolesCount: roles.length
    },
    meta: {
      isSuperAdmin: userIsSuperAdmin
    }
  };
  return handleApiResponse(result, user?.email);
});