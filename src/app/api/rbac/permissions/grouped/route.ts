import { NextRequest } from 'next/server';
import { permissionController } from '@/lib/controllers/PermissionController';
import { handleApiResponse } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { protectRoute } from '@/lib/auth/unified';

export const GET = protectRoute(async (request, { user, params }) => {
  const result = await permissionController.getPermissionsGroupedByResource();
  return handleApiResponse(result, user?.email);
});