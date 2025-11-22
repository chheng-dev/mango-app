import { NextResponse } from 'next/server';

export function setRegularUserCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  // Set the access token in a cookie (matching our middleware expectations)
  response.cookies.set('auth-token', accessToken, {
    httpOnly: true,
    secure: false, // Development
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    // Don't set domain for localhost development
  });

  console.log('AuthController: auth-token cookie set for regular user');
}
