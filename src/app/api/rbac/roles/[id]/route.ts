import { roleController } from "@/lib/controllers/RoleController";
import { BaseRoute, createProtectedRoute, handleApiResponse, handleProtectedRoute } from "@/lib/utils/BaseRoute";
import { PERMISSIONS } from "@/lib/constants/permissions";

type Params = {
  params: {
    id: string;
  };
}

export const GET  = createProtectedRoute(async (request, { user, params }) => {
  const roleId = Number(params?.id);
  
  if (isNaN(roleId) || roleId <= 0) {
    return BaseRoute.errorResponse('Invalid role ID', 400);
  }

  const result = await roleController.getById(roleId);
  return handleApiResponse(result, user?.email);
}, { requiredPermissions: [PERMISSIONS.ROLE_READ] });

export const PUT = createProtectedRoute(async (request, { user, params }) => {
  const roleId = Number(params?.id);
  
  if (isNaN(roleId) || roleId <= 0) {
    return BaseRoute.errorResponse('Invalid role ID', 400);
  }

  const data = await request.json();
  const result = await roleController.update(roleId, data);
  return handleApiResponse(result, user?.email);
}, { requiredPermissions: [PERMISSIONS.ROLE_UPDATE] });

export const DELETE = createProtectedRoute(async (request, { user, params }) => {
  const roleId = Number(params?.id);
  
  if (isNaN(roleId) || roleId <= 0) {
    return BaseRoute.errorResponse('Invalid role ID', 400);
  }

  const result = await roleController.delete(roleId);
  return handleApiResponse(result, user?.email);
}, { requiredPermissions: [PERMISSIONS.ROLE_DELETE] });