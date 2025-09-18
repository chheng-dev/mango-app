import { roleController } from "@/lib/controllers/RoleController";
import { NextRequest } from "next/server";
import { BaseRoute, withErrorHandling } from "@/lib/utils/BaseRoute";
import { PERMISSIONS } from "@/lib/constants/permissions";

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return BaseRoute.handleAuthenticatedGetById(
    request,
    params,
    (id, auth) => roleController.getById(id),
    'Role',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_READ],
      allowSelf: false
    }
  );
}, 'GET Role');

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return BaseRoute.handleAuthenticatedUpdateById(
    request,
    params,
    (id, data, auth) => roleController.update(id, data),
    'Role',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_UPDATE],
      allowSelf: false
    }
  );
}, 'PUT Role');

export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return BaseRoute.handleAuthenticatedDeleteById(
    request,
    params,
    (id, auth) => roleController.delete(id),
    'Role',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_DELETE],
      allowSelf: false
    }
  );
}, 'DELETE Role');
