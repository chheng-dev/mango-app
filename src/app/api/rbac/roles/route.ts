import { roleController } from '@/lib/controllers/RoleController';
import { handleApiResponse } from '@/lib/utils/BaseRoute';
import { protectRoute } from '@/lib/auth/unified';
import { userController } from '@/lib/controllers/UserController';

export const GET = protectRoute(async (request, { user }) => {
  const isSuperAdmin = await userController.isSuperAdmin(user!.id);
  
  const result = await roleController.getAll({ isSuperAdmin });
  return handleApiResponse(result, user?.email);
});

export const POST = protectRoute(async (request, { user }) => {
  const data = await request.json();
  const result = await roleController.create(data);
  return handleApiResponse(result, user?.email);
});