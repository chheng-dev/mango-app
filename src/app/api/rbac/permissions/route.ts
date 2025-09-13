import { NextRequest, NextResponse } from 'next/server';
import { permissionController } from '@/lib/controllers/PermissionController';
import { BaseRoute, withErrorHandling } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const GET = withErrorHandling(async (request: NextRequest) => {
  return BaseRoute.handleAuthenticatedGetCollection(
    request,
    async (params, auth) => {
      const { searchParams } = new URL(request.url);
      const resource = searchParams.get('resource') || undefined;
      
      if (resource) {
        // Get permissions by resource
        return await permissionController.getPermissionsByResource(resource);
      }
      
      // Get all permissions with pagination
      return await permissionController.getAll(params);
    },
    'Permissions',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.PERMISSION_READ]
    }
  );
}, 'GET Permissions');

export const POST = withErrorHandling(async (request: NextRequest) => {
  return BaseRoute.handleAuthenticatedCreate(
    request,
    (data, auth) => permissionController.create(data),
    'Permission',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.PERMISSION_CREATE]
    }
  );
}, 'POST Permission');
