import { protectRoute } from "@/lib/auth/unified";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { roleController } from "@/lib/controllers/RoleController";
import { BaseRoute, handleApiResponse } from "@/lib/utils/BaseRoute";

export const GET  = protectRoute(async (request, { user, params }) => {
  const roleId = Number(params?.id);
  
  if (isNaN(roleId) || roleId <= 0) {
    return BaseRoute.errorResponse('Invalid role ID', 400);
  }
  
  const result = await roleController.countPermissionsForRole(roleId);
  return handleApiResponse(result, user?.email);
});