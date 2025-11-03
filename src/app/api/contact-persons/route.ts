import { protectRoute } from '@/lib/auth/unified';
import { contactPersonController } from '@/lib/controllers/ContactPersonController';
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

  const result = await contactPersonController.getAll(params);   
  return handleApiResponse(result, user.email);
});

export const POST = protectRoute(async (request, { user }) => {
  const data = await request.json();
  const result = await contactPersonController.create(data);
  return handleApiResponse(result, user.email);
});
