import { NextRequest } from 'next/server';
import { userController } from '@/lib/controllers/UserController';
import { handleApiResponse } from '@/lib/utils/BaseRoute';
import { protectRoute } from '@/lib/auth/nextauth-unified';

export const GET = protectRoute(async (request: NextRequest, context) => {
  try {
    const url = new URL(request.url);
    const params = {
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '10'),
      query: url.searchParams.get('query') || url.searchParams.get('search') || undefined,
      sortBy: url.searchParams.get('sortBy') || undefined,
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
      filters: {} as Record<string, any>
    };

    // Parse additional filters from query params
    for (const [key, value] of url.searchParams.entries()) {
      if (!['page', 'limit', 'query', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        params.filters[key] = value;
      }
    }

    // Check if current user is super admin
    const isSuperAdmin = await userController.isSuperAdmin(context.user.id);

    const result = await userController.getAll({ 
      ...params,
      isSuperAdmin 
    });
    
    return handleApiResponse(result, context.user?.email);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return handleApiResponse({
      success: false,
      error: 'Failed to fetch users'
    }, context.user?.email);
  }
}, {
  requiredPermissions: ['user:read']
});

export const POST = protectRoute(async (request: NextRequest, context) => {
  try {
  const data = await request.json();
  const result = await userController.create(data);
    return handleApiResponse(result, context.user?.email);
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return handleApiResponse({
      success: false,
      error: 'Failed to create user'
    }, context.user?.email);
  }
}, {
  requiredPermissions: ['user:create']
});
