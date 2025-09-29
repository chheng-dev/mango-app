import { userController } from '@/lib/controllers/UserController';
import { NextRequest } from "next/server";
import { BaseRoute, handleProtectedRoute, handleApiResponse } from "@/lib/utils/BaseRoute";
import { PERMISSIONS } from "@/lib/constants/permissions";

export const GET = handleProtectedRoute(async (request: NextRequest, { auth }) => {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  if (!id || isNaN(Number(id))) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  const userId = Number(id);
  
  if (auth.user.id !== userId) {
    return BaseRoute.errorResponse('Access denied', 403);
  }

  const result = await userController.getById(userId);
  return handleApiResponse(result, auth.user?.email);
}, {
  requiredPermissions: [PERMISSIONS.USER_READ]
});

export const PUT = handleProtectedRoute(async (request: NextRequest, { auth }) => {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  if (!id || isNaN(Number(id))) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  const userId = Number(id);
  
  if (auth.user.id !== userId) {
    return BaseRoute.errorResponse('Access denied', 403);
  }

  const data = await request.json();
  const result = await userController.update(userId, data);
  return handleApiResponse(result, auth.user?.email);
}, {
  requiredPermissions: [PERMISSIONS.USER_UPDATE]
});

export const DELETE = handleProtectedRoute(async (request: NextRequest, { auth }) => {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  if (!id || isNaN(Number(id))) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  const userId = Number(id);
  
  const result = await userController.delete(userId);
  return handleApiResponse(result, auth.user?.email);
}, {
  requiredPermissions: [PERMISSIONS.USER_DELETE]
});
