import { PERMISSIONS } from "@/lib/constants/permissions";
import { roleController } from "@/lib/controllers/RoleController";
import { BaseRoute, createProtectedRoute, handleApiResponse } from "@/lib/utils/BaseRoute";

export const GET  = createProtectedRoute(async (request, { user, params }) => {

  const roleId = Number(params?.id);
  if (isNaN(roleId) || roleId <= 0) {
    return BaseRoute.errorResponse('Invalid role ID', 400);
  }

  const result = await roleController.countUsersForRole(roleId);
  return handleApiResponse(result, user?.email);
}, { requiredPermissions: [PERMISSIONS.USER_READ, PERMISSIONS.ROLE_READ] });  