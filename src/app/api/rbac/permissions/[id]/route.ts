import { permissionController } from "@/lib/controllers/PermissionController";
import { BaseRoute, handleApiResponse } from "@/lib/utils/BaseRoute";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { protectRoute } from "@/lib/auth/unified";

export const GET = protectRoute(async (request, context) => {
  const permissionId = Number(context.params?.id);
  console.log('Permission ID:', permissionId);
  
  if (isNaN(permissionId) || permissionId <= 0) {
    return BaseRoute.errorResponse('Invalid permission ID', 400);
  }

  const result = await permissionController.getById(permissionId);
  return handleApiResponse(result, context.user?.email);
});

export const PUT = protectRoute(async (request, { user, params }) => {
  const permissionId = Number(params?.id);
  
  if (isNaN(permissionId) || permissionId <= 0) {
    return BaseRoute.errorResponse('Invalid permission ID', 400);
  }

  const data = await request.json();
  const result = await permissionController.update(permissionId, data);
  return handleApiResponse(result, user?.email);
});

export const DELETE = protectRoute(async (request, { user, params }) => {
  const permissionId = Number(params?.id);
  
  if (isNaN(permissionId) || permissionId <= 0) {
    return BaseRoute.errorResponse('Invalid permission ID', 400);
  }

  const result = await permissionController.delete(permissionId);
  return handleApiResponse(result, user?.email);
});