import { userController } from '@/lib/controllers/UserController';
import { NextRequest } from "next/server";
import { createUserResourceHandler } from '@/lib/utils/apiHandlers';

export const GET = createUserResourceHandler('READ', async (userId) => {
  return await userController.getById(userId);
});

export const PUT = createUserResourceHandler('UPDATE', async (userId, request) => {
  const data = await request.json();
  return await userController.update(userId, data);
});

export const DELETE = createUserResourceHandler('DELETE', async (userId) => {
  return await userController.delete(userId);
});
