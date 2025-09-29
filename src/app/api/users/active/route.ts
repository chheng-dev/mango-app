import { NextRequest } from 'next/server';
import { userController } from '@/lib/controllers/UserController';
import { handleApiResponse, handleProtectedRoute } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const GET = handleProtectedRoute(async (request: NextRequest, { user }) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const query = searchParams.get('q') || searchParams.get('search') || undefined;
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const result = await userController.getAll({
    page,
    limit,
    query,
    sortBy,
    sortOrder,
    filters: { isActive: true },
  });

  return handleApiResponse(result, user?.email);
}, { requiredPermissions: [PERMISSIONS.USER_READ] });
