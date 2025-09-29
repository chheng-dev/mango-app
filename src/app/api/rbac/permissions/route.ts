import { NextRequest } from 'next/server';
import { permissionController } from '@/lib/controllers/PermissionController';
import { handleApiResponse, handleProtectedRoute } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';


export const GET = handleProtectedRoute(async (request: NextRequest, { auth }) => {
  const url = new URL(request.url);
  const resource = url.searchParams.get('resource') || undefined;

  let result;
  if (resource) {
    result = await permissionController.getPermissionsByResource(resource);
  } else {
    result = await permissionController.getAll();
  }

  return handleApiResponse(result, auth.user?.email);
}, { requiredPermissions: [PERMISSIONS.PERMISSION_READ] });

export const POST = handleProtectedRoute(async (request: NextRequest, { auth }) => {
  const data = await request.json();
  const result = await permissionController.create(data);
  return handleApiResponse(result, auth.user?.email);
}, { requiredPermissions: [PERMISSIONS.PERMISSION_CREATE] });