import { protectRoute } from '@/lib/auth/unified';
import { userController } from '@/lib/controllers/UserController';
import { handleApiResponse } from '@/lib/utils/BaseRoute';

export const GET = protectRoute(async (request, { user }) => {
  const url = new URL(request.url);
  const params = {
    page: parseInt(url.searchParams.get('page') || '1'),
    limit: parseInt(url.searchParams.get('limit') || '10'),
    search: url.searchParams.get('search') || undefined,
    sortBy: url.searchParams.get('sortBy') || undefined,
    sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc'
  };

  // Check if requester is super-admin
  const isSuperAdmin = await userController.isSuperAdmin(user.id);

  // Pass isSuperAdmin flag to filter users accordingly
  const result = await userController.getAll({ isSuperAdmin });
  return handleApiResponse(result, user.email);
});

export const POST = protectRoute(async (request, { user }) => {
  const data = await request.json();
  const result = await userController.create(data);
  return handleApiResponse(result, user.email);
});
