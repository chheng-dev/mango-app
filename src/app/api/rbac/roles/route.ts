import { roleController } from '@/lib/controllers/RoleController';
import { NextRequest, NextResponse } from 'next/server';
import { BaseRoute, withErrorHandling } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const GET = withErrorHandling(async (request: NextRequest) => {
  return BaseRoute.handleAuthenticatedGetCollection(
    request,
    async (params, auth) => {
      const { searchParams } = new URL(request.url);
      const includePermissions = searchParams.get('includePermissions') === 'true';
      
      const enhancedParams = {
        ...params,
        includePermissions
      };

      return await roleController.getAllRoles(enhancedParams);
    },
    'Roles',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_READ]
    }
  );
}, 'GET Roles');

export const POST = withErrorHandling(async (request: NextRequest) => {
  return BaseRoute.handleAuthenticatedCreate(
    request,
    (data, auth) => roleController.create(data),
    'Role',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.ROLE_CREATE]
    }
  );
}, 'POST Role');
