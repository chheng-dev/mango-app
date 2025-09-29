import { userController } from '@/lib/controllers/UserController';
import { NextRequest } from 'next/server';
import { handleProtectedRoute, handleApiResponse } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const GET = handleProtectedRoute(async (request: NextRequest, { user }) => {
  const url = new URL(request.url);
  const params = {
    page: parseInt(url.searchParams.get('page') || '1'),
    limit: parseInt(url.searchParams.get('limit') || '10'),
    search: url.searchParams.get('search') || undefined,
    sortBy: url.searchParams.get('sortBy') || undefined,
    sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc'
  };

  const result = await userController.getAll(params);
  return handleApiResponse(result, user?.email);
}, {
  requiredPermissions: [PERMISSIONS.USER_READ]
});

export const POST = handleProtectedRoute(async (request: NextRequest, { user }) => {
  const data = await request.json();
  const result = await userController.create(data);
  return handleApiResponse(result, user?.email);
}, {
  requiredPermissions: [PERMISSIONS.USER_CREATE]
});
