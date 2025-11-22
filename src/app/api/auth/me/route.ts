import { NextRequest } from 'next/server';
import { handleApiResponse } from '@/lib/utils/BaseRoute';
import { protectRoute } from '@/lib/auth/nextauth-unified';
import { userController } from '@/lib/controllers/UserController';

export const GET = protectRoute(async (request: NextRequest, { user }) => {
  const [userRoles, userPermissions, isSuperAdmin] = await Promise.all([
    userController.getUserRoles(user.id),
    userController.getUserPermissions(user.id),
    userController.isSuperAdmin(user.id)
  ]);

  const result = {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      code: user.code,
      isVerified: user.isVerified,
      roles: userRoles,
      permissions: userPermissions,
      isSuperAdmin
    },
    message: 'User profile retrieved successfully'
  };

  return handleApiResponse(result, user?.email);
}, {
  requiredPermissions: []
});

