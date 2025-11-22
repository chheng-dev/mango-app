import { protectRoute } from "@/lib/auth/nextauth-unified";
import { customerController } from "@/lib/controllers/CustomerController";
import { handleApiResponse } from "@/lib/utils/BaseRoute";

export const GET = protectRoute(async (request, { user }) => {
  const customers = await customerController.getAll();
  return handleApiResponse(customers, user.email);
});

export const POST = protectRoute(async (request, { user }) => {
  const data = await request.json();
  const result = await customerController.create(data);
  return handleApiResponse(result, user.email);
});