import { userController } from '@/lib/controllers/UserController';
import { createApiRoutes } from '@/lib/api/BaseApiHandler';

const routes = createApiRoutes(userController);

export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
