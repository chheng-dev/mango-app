import { permissionController } from "@/lib/controllers/PermissionController";
import { NextRequest, NextResponse } from "next/server";
import { BaseRoute, withErrorHandling } from "@/lib/utils/BaseRoute";
import { PERMISSIONS } from "@/lib/middleware/AuthMiddleware";

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return BaseRoute.handleAuthenticatedGetById(
    request,
    params,
    (id, auth) => permissionController.getById(id),
    'Permission',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.PERMISSIONS_READ],
      allowSelf: false
    }
  );
}, 'GET Permission');

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return BaseRoute.handleAuthenticatedUpdateById(
    request,
    params,
    (id, data, auth) => permissionController.update(id, data),
    'Permission',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.PERMISSIONS_UPDATE],
      allowSelf: false
    }
  );
}, 'PUT Permission');

export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return BaseRoute.handleAuthenticatedDeleteById(
    request,
    params,
    (id, auth) => permissionController.delete(id),
    'Permission',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.PERMISSIONS_DELETE],
      allowSelf: false
    }
  );
}, 'DELETE Permission');
