import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';

/**
 * User Email Verification API Routes
 * PUT /api/users/verification?id=123 - Verify user email
 */

// PUT /api/users/verification?id=123 - Verify user email
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID parameter is required'
        },
        { status: 400 }
      );
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID'
        },
        { status: 400 }
      );
    }

    const result = await userController.update(userId, { isVerified: true });
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    console.error('Verify user email API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
//     console.error('Update user verification error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : 'Failed to update user verification'
//       },
//       { status: 500 }
//     );
//   }
// }

// // GET /api/users/verification?isVerified=true - Get users by verification status
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const isVerified = searchParams.get('isVerified') === 'true';
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');

//     const result = await userController.getUsersByVerificationStatus(isVerified, {
//       page,
//       limit
//     });

//     return NextResponse.json(result, { 
//       status: result.success ? 200 : 400 
//     });

//   } catch (error) {
//     console.error('Get users by verification status error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : 'Failed to get users by verification status'
//       },
//       { status: 500 }
//     );
//   }
// }
