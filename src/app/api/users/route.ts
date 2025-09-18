import { userController } from '@/lib/controllers/UserController';
import { NextRequest } from "next/server";
import { BaseRoute, withErrorHandling } from "@/lib/utils/BaseRoute";
import { PERMISSIONS } from "@/lib/constants/permissions";

export const GET = withErrorHandling(async (request: NextRequest) => {
  return BaseRoute.handleAuthenticatedGetCollection(
    request,
    (params, auth) => userController.getAll(params),
    'Users',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.USER_READ],
      allowSelf: false
    }
  );
}, 'GET Users');

export const POST = withErrorHandling(async (request: NextRequest) => {
  return BaseRoute.handleAuthenticatedCreate(
    request,
    (data, auth) => userController.create(data),
    'User',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.USER_CREATE],
      allowSelf: false
    }
  );
}, 'POST User');