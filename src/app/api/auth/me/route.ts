import { NextResponse } from 'next/server';
import { AuthenticatedRequest, withAuth } from '@/lib/middleware/auth';

/**
 * Token verification and user profile API
 */

// GET /api/auth/me - Get current user profile from token
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user;
    
    return NextResponse.json({  
      success: true,
      data: user,
      message: 'User profile retrieved successfully'
    });
    
  } catch (error) { 
    console.error('Get user profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user profile'
      },
      { status: 500 }
    );
  }
});

// export async function POST(request: NextRequest) {
//   try {
//     // Try to get token from Authorization header first
//     let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
//     // If not in header, try to get from cookies
//     if (!token) {
//       token = request.cookies.get('auth-token')?.value;
//     }

//     if (!token) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: 'No authentication token provided'
//         },
//         { status: 401 }
//       );
//     }

//     const result = await userController.refreshToken(token);
    
//     if (result.success && result.data) {
//       // Set new token in HTTP-only cookie
//       const response = NextResponse.json(result, { 
//         status: 200 
//       });
      
//       response.cookies.set('auth-token', result.data.token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 24 * 60 * 60 // 24 hours
//       });

//       return response;
//     }

//     return NextResponse.json(result, { 
//       status: 401 
//     });

//   } catch (error) {
//     console.error('Token refresh error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: 'Token refresh failed'
//       },
//       { status: 401 }
//     );
//   }
// }
