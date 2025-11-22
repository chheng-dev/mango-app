import { userController } from '@/lib/controllers/UserController';
import { handleApiResponse } from '@/lib/utils/BaseRoute';
import { protectRoute } from '@/lib/auth/nextauth-unified';

export const GET = protectRoute(async (request, context) => {
  const userId = parseInt(context.params.id);
  const result = await userController.getById(userId);
  return handleApiResponse(result, context.user?.email);
}, {
  requiredPermissions: ['user:read']
});

export const PUT = protectRoute(async (request, context) => {
  const userId = parseInt(context.params.id);
  const data = await request.json();
  const result = await userController.update(userId, data);
  return handleApiResponse(result, context.user?.email);
}, {
  requiredPermissions: ['user:update']
});

export const DELETE = protectRoute(async (request, context) => {
  const userId = parseInt(context.params.id);
  const result = await userController.delete(userId);
  return handleApiResponse(result, context.user?.email);
}, {
  requiredPermissions: ['user:delete']
});
