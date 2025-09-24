import { permissionController } from "@/lib/controllers/PermissionController";
import { NextRequest, NextResponse } from "next/server";
import { BaseRoute, withErrorHandling } from "@/lib/utils/BaseRoute";
import { PERMISSIONS } from "@/lib/constants/permissions";

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return BaseRoute.handleAuthenticatedGetById(
    request,
    params,
    async (permissionId: number, auth?: any) => {
      return await permissionController.getById(permissionId);
    },
    'Permission',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.PERMISSION_READ]
    }
  );
}, 'GET Permission');

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return BaseRoute.handleAuthenticatedUpdateById(
    request,
    params,
    async (permissionId: number, data: any, auth?: any) => {
      return await permissionController.update(permissionId, data);
    },
    'Permission',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.PERMISSION_UPDATE]
    }
  );
}, 'PUT Permission');

export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  return BaseRoute.handleAuthenticatedDeleteById(
    request,
    params,
    async (permissionId: number, auth?: any) => {
      return await permissionController.delete(permissionId);
    },
    'Permission',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.PERMISSION_DELETE]
    }
  );
}, 'DELETE Permission');
