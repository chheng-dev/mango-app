import { userController } from '@/lib/controllers/UserController';
import { NextRequest } from 'next/server';
import { handleProtectedRoute, handleApiResponse } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const PUT = handleProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const body = await request.json();
    const url = new URL(request.url);
    const idParam = url.searchParams.get('userId') ?? body?.userId;
    if (!idParam) {
      return handleApiResponse({ success: false, error: 'User ID is required' }, auth?.user?.email);
    }

    const userId = Number(idParam);
    if (Number.isNaN(userId)) {
      return handleApiResponse({ success: false, error: 'Invalid userId parameter' }, auth?.user?.email);
    }

    const isActive = body?.isActive;
    if (typeof isActive !== 'boolean') {
      return handleApiResponse({ success: false, error: 'isActive must be a boolean value' }, auth?.user?.email);
    }

    const result = await userController.updateStatus(userId, isActive);
    return handleApiResponse(result, auth?.user?.email);
  },
  { requiredPermissions: [PERMISSIONS.USER_UPDATE] }
);

export const PATCH = handleProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const body = await request.json();
    const userIds = body?.userIds;
    const isActive = body?.isActive;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return handleApiResponse({ success: false, error: 'userIds must be a non-empty array' }, auth?.user?.email);
    }

    const ids = userIds.map((id: any) => Number(id)).filter((n: number) => !Number.isNaN(n));
    if (ids.length === 0) {
      return handleApiResponse({ success: false, error: 'No valid user ids provided' }, auth?.user?.email);
    }

    const result = await userController.bulkUpdateStatus(ids, isActive);
    return handleApiResponse(result, auth?.user?.email);
  },
  { requiredPermissions: [PERMISSIONS.USER_UPDATE] }
);
