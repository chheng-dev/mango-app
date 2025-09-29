import { NextRequest } from 'next/server';
import { permissionController } from '@/lib/controllers/PermissionController';
import { handleApiResponse, handleProtectedRoute } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const GET = handleProtectedRoute(async (request: NextRequest, { auth }) => {
  const result = await permissionController.getPermissionsGroupedByResource();
  return handleApiResponse(result, auth.user?.email);
}, { requiredPermissions: [PERMISSIONS.PERMISSION_READ]});