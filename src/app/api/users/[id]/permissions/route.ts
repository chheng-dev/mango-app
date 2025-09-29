import { NextRequest, NextResponse } from 'next/server';
import { getUserPermissions, getUserRoles, isSuperAdmin } from '@/lib/services/rbac-service';
import { BaseRoute, handleProtectedRoute, handleApiResponse, createProtectedRoute } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

type Params = {
  params: { 
    id: string;
  };
}

export const GET = createProtectedRoute(async (request, { user, params }) => {
  const userId = Number(params?.id);
  
  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  const [permissions, roles, userIsSuperAdmin] = await Promise.all([
    getUserPermissions(userId),
    getUserRoles(userId),
    isSuperAdmin(userId)
  ]);

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
}, {
  requiredPermissions: [PERMISSIONS.USER_READ]
});
