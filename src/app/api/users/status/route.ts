import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';

/**
 * User Status Management API Routes
 * PUT /api/users/status - Update single user status
 * PATCH /api/users/status - Bulk update user status
 */

// Update single user status
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isActive must be a boolean value' },
        { status: 400 }
      );
    }

    const result = await userController.updateStatus(parseInt(id), isActive);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    });
  } catch (error) {
    console.error('Update user status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Bulk update user status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, isActive } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'userIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isActive must be a boolean value' },
        { status: 400 }
      );
    }

    const result = await userController.bulkUpdateStatus(userIds, isActive);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    });
  } catch (error) {
    console.error('Bulk update user status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
