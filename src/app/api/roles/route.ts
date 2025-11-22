import { roleController } from '@/lib/controllers/RoleController';
import { handleApiResponse } from '@/lib/utils/BaseRoute';
import { protectRoute } from '@/lib/auth/nextauth-unified';
import { NextRequest } from 'next/server';

export const GET = protectRoute(async (request: NextRequest, { user }) => {
  const { searchParams } = new URL(request.url);

  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
  const query = searchParams.get('query') || undefined;
  const search = searchParams.get('search') || undefined;
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;
  const searchText = search || query;
  const result = await roleController.getAll({
    page,
    limit,
    search: searchText,
    sortBy,
    sortOrder
  });
  return handleApiResponse(result, user?.email);
}, {
  requiredPermissions: ['role:read']
});

export const POST = protectRoute(async (request, { user }) => {
  const data = await request.json();
  const result = await roleController.create(data);
  return handleApiResponse(result, user?.email);
}, {
  requiredPermissions: ['role:create']
});
