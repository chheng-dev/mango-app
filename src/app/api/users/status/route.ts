import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';

/**
 * Custom routes for user status operations
 */

// PUT /api/users/status?id=123&isActive=true - Update user active status
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const isActive = searchParams.get('isActive') === 'true';

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID parameter is required'
        },
        { status: 400 }
      );
    }

    const result = await userController.update(parseInt(id), { isActive });
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    console.error('Update user status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user status'
      },
      { status: 500 }
    );
  }
}

// POST /api/users/status/bulk - Bulk update user status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, isActive } = body;

    if (!Array.isArray(ids) || typeof isActive !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body. Expected: { ids: number[], isActive: boolean }'
        },
        { status: 400 }
      );
    }

    const result = await userController.bulkUpdateStatus(ids, isActive);
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    console.error('Bulk update user status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk update user status'
      },
      { status: 500 }
    );
  }
}
