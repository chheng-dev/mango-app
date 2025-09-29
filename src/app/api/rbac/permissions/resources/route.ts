import { NextRequest } from 'next/server';
import { permissionController } from '@/lib/controllers/PermissionController';
import { BaseRoute, handleApiResponse, handleProtectedRoute } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const GET = handleProtectedRoute(async (request: NextRequest, { auth }) => {
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource');
  if (!resource) {
    return BaseRoute.errorResponse('Missing resource parameter', 400);
  }

  const result = await permissionController.getPermissionsByResource(resource);
  return handleApiResponse(result, auth.user?.email);
}, { requiredPermissions: [PERMISSIONS.PERMISSION_READ] });