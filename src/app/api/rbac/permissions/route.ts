import { NextRequest } from 'next/server';
import { permissionController } from '@/lib/controllers/PermissionController';
import { handleApiResponse } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { protectRoute } from '@/lib/auth/unified';

export const GET = protectRoute(async (request: NextRequest, { user  }) => {
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource') || undefined;

  let result;
  if (resource) {
    result = await permissionController.getPermissionsByResource(resource);
  } else {
    result = await permissionController.getAll();
  }

  return handleApiResponse(result, user?.email);
});

export const POST = protectRoute(async (request: NextRequest, { user }) => {
  const data = await request.json();
  const result = await permissionController.create(data);
  return handleApiResponse(result, user?.email);
});