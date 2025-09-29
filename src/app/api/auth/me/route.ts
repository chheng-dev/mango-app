import { NextRequest } from 'next/server';
import { handleProtectedRoute, handleApiResponse } from '@/lib/utils/BaseRoute';

export const GET = handleProtectedRoute(async (request: NextRequest, { user }) => {
  const result = {
    success: true,
    data: user,
    message: 'User profile retrieved successfully'
  };

  return handleApiResponse(result, user?.email);
}, {
  requiredPermissions: []
});

