import { permissionController } from "@/lib/controllers/PermissionController";
import { BaseRoute, handleApiResponse, createProtectedRoute } from "@/lib/utils/BaseRoute";
import { PERMISSIONS } from "@/lib/constants/permissions";

export const GET = createProtectedRoute(async (request, { user, params }) => {
  const permissionId = Number(params?.id);
  
  if (isNaN(permissionId) || permissionId <= 0) {
    return BaseRoute.errorResponse('Invalid permission ID', 400);
  }

  const result = await permissionController.getById(permissionId);
  return handleApiResponse(result, user?.email);
}, { requiredPermissions: [PERMISSIONS.PERMISSION_READ] });

export const PUT = createProtectedRoute(async (request, { user, params }) => {
  const permissionId = Number(params?.id);
  
  if (isNaN(permissionId) || permissionId <= 0) {
    return BaseRoute.errorResponse('Invalid permission ID', 400);
  }

  const data = await request.json();
  const result = await permissionController.update(permissionId, data);
  return handleApiResponse(result, user?.email);
}, { requiredPermissions: [PERMISSIONS.PERMISSION_UPDATE] });

export const DELETE = createProtectedRoute(async (request, { user, params }) => {
  const permissionId = Number(params?.id);
  
  if (isNaN(permissionId) || permissionId <= 0) {
    return BaseRoute.errorResponse('Invalid permission ID', 400);
  }

  const result = await permissionController.delete(permissionId);
  return handleApiResponse(result, user?.email);
}, { requiredPermissions: [PERMISSIONS.PERMISSION_DELETE] });