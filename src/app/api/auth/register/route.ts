import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';
import { BaseRoute, withErrorHandling } from '@/lib/utils/BaseRoute';

/**
 * User Registration API
 */

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { email, name, code, password, passwordConfirmation, dob, phoneNumber } = body;

    // Validate required fields
    if (!email || !name || !code || !password || !passwordConfirmation) {
      return BaseRoute.errorResponse(
        'Email, name, code, password, and password confirmation are required',
        400
      );
    }

    // Check password match
    if (password !== passwordConfirmation) {
      return BaseRoute.errorResponse(
        'Password confirmation does not match',
        400
      );
    }

    // Create user data object
    const userData = {
      email,
      name,
      code,
      passwordHash: password, // Will be hashed in transformForSave
      passwordConfirmation: password, // Will be hashed in transformForSave
      dob: dob ? new Date(dob) : undefined,
      phoneNumber
    };

    const result = await userController.create(userData);
    
    if (result.success && result.data) {
      // Automatically log in the user after successful registration
      const loginResult = await userController.login(email, password);
      
      if (loginResult.success && loginResult.data) {
        // Set token in HTTP-only cookie
        const response = NextResponse.json({
          success: true,
          data: {
            user: loginResult.data.user,
            token: loginResult.data.token
          },
          message: 'Registration successful and logged in'
        }, { status: 201 });
        
        response.cookies.set('auth-token', loginResult.data.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 // 24 hours
        });

        return response;
      }
    }

    return BaseRoute.successResponse(result, {
      successStatus: result.success ? 201 : 400
    });

  } catch (error) {
    console.error('Registration API error:', error);
    return BaseRoute.errorResponse(
      error instanceof Error ? error.message : 'Registration failed',
      500
    );
  }
}, 'POST Register');
