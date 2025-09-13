import { userController } from '@/lib/controllers/UserController';
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
    (id, auth) => userController.getById(id),
    'User',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.USER_READ],
      allowSelf: true // Users can access their own data
    }
  );
}, 'GET User');

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return BaseRoute.handleAuthenticatedUpdateById(
    request,
    params,
    (id, data, auth) => userController.update(id, data),
    'User',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.USER_UPDATE],
      allowSelf: true // Users can update their own data
    }
  );
}, 'PUT User');

export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  return BaseRoute.handleAuthenticatedDeleteById(
    request,
    params,
    (id, auth) => userController.delete(id),
    'User',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.USER_DELETE],
      allowSelf: false // Users cannot delete themselves
    }
  );
}, 'DELETE User');
