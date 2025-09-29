import { roleController } from '@/lib/controllers/RoleController';
import { createProtectedRoute, handleApiResponse, handleProtectedRoute } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const GET  = createProtectedRoute(async (request, { user }) => {
  const result = await roleController.getAll();
  return handleApiResponse(result, user?.email);
}, { requiredPermissions: [PERMISSIONS.ROLE_READ] });

export const POST = createProtectedRoute(async (request, { user }) => {
  const data = await request.json();
  const result = await roleController.create(data);
  return handleApiResponse(result, user?.email);
}, { requiredPermissions: [PERMISSIONS.ROLE_CREATE] });