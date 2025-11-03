import { protectRoute } from "@/lib/auth/unified";
import { contactPersonController } from "@/lib/controllers/ContactPersonController";
import { handleApiResponse } from "@/lib/utils/BaseRoute";

export const GET = protectRoute(async (request,  context) => {
  const { ccode } = context.params;
  const result = await contactPersonController.getByCode(ccode);
  return handleApiResponse(result, context.user.email);
});

export const PUT = protectRoute(async (request, context) => {
  const { ccode } = context.params;
  console.log('Updating contact person with code:', ccode);
  const data = await request.json();
  const result = await contactPersonController.updateByCode(ccode, data);
  return handleApiResponse(result, context.user.email);
});

export const DELETE = protectRoute(async (request, context) => {
  const { ccode } = context.params;
  const result = await contactPersonController.deleteByCode(ccode);
  return handleApiResponse(result, context.user.email);
});