import { NextRequest } from 'next/server';
import { permissionController } from '@/lib/controllers/PermissionController';
import { BaseRoute, handleApiResponse } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { protectRoute } from '@/lib/auth/unified';

export const GET = protectRoute(async (request: NextRequest, { user }) => {
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource');
  if (!resource) {
    return BaseRoute.errorResponse('Missing resource parameter', 400);
  }

  const result = await permissionController.getPermissionsByResource(resource);
  return handleApiResponse(result, user?.email);
});