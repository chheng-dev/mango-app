import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/health",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/",
    "/about",
    "/contact"
  ];

  const authRoutes = [
    "/login",
    "/register"
  ];

  const protectedPageRoutes = [
    "/admin",
    "/profile",
    "/settings"
  ];

  const protectedApiRoutes = [
    "/api/auth/me",
    "/api/auth/logout",
    "/api/profile",
    "/api/users"
  ];

  // Check if it's a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Check if it's an auth route (login, register, etc.)
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Check if it's a protected page
  const isProtectedPage = protectedPageRoutes.some(route => {
    if (route.endsWith("/*")) {
      return pathname.startsWith(route.slice(0, -2));
    }
    return pathname.startsWith(route);
  });

  // Check if it's a protected API route
  const isProtectedApi = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get token from cookie or header
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Redirect authenticated users away from auth pages (login, register)
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Handle protected pages (redirect to login)
  if (isProtectedPage && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle protected API routes (return 401)
  if (isProtectedApi && !token) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Continue if authenticated or unprotected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};