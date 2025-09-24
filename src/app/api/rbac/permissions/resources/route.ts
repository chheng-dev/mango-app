import { NextRequest, NextResponse } from 'next/server';
import { permissionController } from '@/lib/controllers/PermissionController';
import { BaseRoute, withErrorHandling } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const GET = withErrorHandling(async (request: NextRequest) => {
  return BaseRoute.handleAuthenticatedGetCollection(
    request,
    async (params, auth) => {
      return await permissionController.getUniqueResources();
    },
    'Permission Resources',
    {
      requireAuth: true,
      requiredPermissions: [PERMISSIONS.PERMISSION_READ]
    }
  );
}, 'GET Permission Resources');
