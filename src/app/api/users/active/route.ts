import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';

/**
 * Get active users only - filtered endpoint
 */

// GET /api/users/active - Get all active users with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('q') || searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const includeRoles = searchParams.get('includeRoles') === 'true';

    // Use the clean service-based getAll method with isActive filter
    const result = await userController.getAll({
      page,
      limit,
      query,
      sortBy,
      sortOrder,
      isActive: true, // Only get active users
      includeRoles
    });

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    console.error('Get active users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get active users'
      },
      { status: 500 }
    );
  }
}

