import { protectRoute } from '@/lib/auth/nextauth-unified';
import { roleController } from '@/lib/controllers/RoleController';
import { userController } from '@/lib/controllers/UserController';
import { BaseRoute, handleApiResponse } from '@/lib/utils/BaseRoute';
import { NextRequest } from 'next/server';

export const GET = protectRoute(
  async (request: NextRequest, context) => {
    const roleId = Number(context.params?.id);
    
    if (isNaN(roleId) || roleId <= 0) {
      return BaseRoute.errorResponse('Invalid role ID', 400);
    }
    
    if (!context.user?.id) {
      return BaseRoute.errorResponse('User not found', 401);
    }
    
    const isSuperAdmin = await userController.isSuperAdmin(context.user.id);
    
    const result = await roleController.getRoleWithPermissions(roleId, { isSuperAdmin });
    return handleApiResponse(result, context.user?.email);
  }, {
    requiredPermissions: ['role:read']
  });

export const POST = protectRoute(
  async (request: NextRequest, context) => {
    const roleId = Number(context.params?.id);
    
    if (isNaN(roleId) || roleId <= 0) {
      return BaseRoute.errorResponse('Invalid role ID', 400);
    }

    if (!context.user?.id) {
      return BaseRoute.errorResponse('User not found', 401);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return BaseRoute.errorResponse('Invalid request body', 400);
    }

    const { permissionIds } = body;
    
    if (!Array.isArray(permissionIds)) {
      return BaseRoute.errorResponse('permissionIds must be an array', 400);
    }

    if (permissionIds.length === 0) {
      return BaseRoute.errorResponse('permissionIds cannot be empty', 400);
    }

    if (permissionIds.some((id: any) => typeof id !== 'number' || id <= 0 || !Number.isInteger(id))) {
      return BaseRoute.errorResponse('permissionIds must be an array of positive integers', 400);
    }

    const result = await roleController.assignPermissionsToRole(roleId, permissionIds);
    return handleApiResponse(result, context.user?.email);
  }, {
    requiredPermissions: ['role:update']
  }
);

export const PUT = protectRoute(
  async (request: NextRequest, context) => {
    const roleId = Number(context.params?.id);
    
    if (isNaN(roleId) || roleId <= 0) {
      return BaseRoute.errorResponse('Invalid role ID', 400);
    }

    if (!context.user?.id) {
      return BaseRoute.errorResponse('User not found', 401);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return BaseRoute.errorResponse('Invalid request body', 400);
    }

    const { permissionIds } = body;
    
    if (!Array.isArray(permissionIds)) {
      return BaseRoute.errorResponse('permissionIds must be an array', 400);
    }

    if (permissionIds.some((id: any) => typeof id !== 'number' || id <= 0 || !Number.isInteger(id))) {
      return BaseRoute.errorResponse('permissionIds must be an array of positive integers', 400);
    }

    const result = await roleController.updatePermissionsForRole(roleId, permissionIds);
    return handleApiResponse(result, context.user?.email);
  }, {
    requiredPermissions: ['role:update']
  }
);

export const DELETE = protectRoute(
  async (request: NextRequest, context) => {
    const roleId = Number(context.params?.id);
    
    if (isNaN(roleId) || roleId <= 0) {
      return BaseRoute.errorResponse('Invalid role ID', 400);
    }

    if (!context.user?.id) {
      return BaseRoute.errorResponse('User not found', 401);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return BaseRoute.errorResponse('Invalid request body', 400);
    }

    const { permissionIds } = body;
    
    if (!Array.isArray(permissionIds)) {
      return BaseRoute.errorResponse('permissionIds must be an array', 400);
    }

    if (permissionIds.length === 0) {
      return BaseRoute.errorResponse('permissionIds cannot be empty', 400);
    }

    if (permissionIds.some((id: any) => typeof id !== 'number' || id <= 0 || !Number.isInteger(id))) {
      return BaseRoute.errorResponse('permissionIds must be an array of positive integers', 400);
    }

    const result = await roleController.removePermissionsFromRole(roleId, permissionIds);
    return handleApiResponse(result, context.user?.email);
  }, {
    requiredPermissions: ['role:update']
  }
);