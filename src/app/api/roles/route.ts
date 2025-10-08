import { roleController } from '@/lib/controllers/RoleController';
import { createRoleListHandler } from '@/lib/utils/apiHandlers';

export const GET = createRoleListHandler('LIST', async (request) => {
  const url = new URL(request.url);
  const params = {
    page: parseInt(url.searchParams.get('page') || '1'),
    limit: parseInt(url.searchParams.get('limit') || '10'),
    search: url.searchParams.get('search') || undefined,
    sortBy: url.searchParams.get('sortBy') || undefined,
    sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc'
  };

  return await roleController.getAll(params);
});

export const POST = createRoleListHandler('CREATE', async (request) => {
  const data = await request.json();
  return await roleController.create(data);
});
