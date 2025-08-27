import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';

/**
 * Custom routes for user verification operations
 */

// PUT /api/users/verification?id=123&isVerified=true - Update user verification status
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const isVerified = searchParams.get('isVerified') === 'true';

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID parameter is required'
        },
        { status: 400 }
      );
    }

    const result = await userController.updateVerificationStatus(parseInt(id), isVerified);
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    console.error('Update user verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user verification'
      },
      { status: 500 }
    );
  }
}

// GET /api/users/verification?isVerified=true - Get users by verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isVerified = searchParams.get('isVerified') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await userController.getUsersByVerificationStatus(isVerified, {
      page,
      limit
    });

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    console.error('Get users by verification status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get users by verification status'
      },
      { status: 500 }
    );
  }
}
