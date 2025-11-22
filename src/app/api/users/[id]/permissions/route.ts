import { protectRoute } from '@/lib/auth/nextauth-unified';
import { userController } from '@/lib/controllers/UserController';
import { NextResponse } from 'next/server';

export const GET = protectRoute(async (request, { user, params }) => {
  try {
    const result = await userController.getUserPermissionsDetailed(user.id);
    
    // Wrap the result in the expected API response format
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get user permissions'
    }, { status: 500 });
  }
});