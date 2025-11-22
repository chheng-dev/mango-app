import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Check for custom auth token instead of NextAuth
  const authToken = req.cookies.get('auth-token')?.value;

  let pathWithoutLocale = pathname;
  let currentLocale = "en";
  let hasLocaleInPath = false;

  const locales = ["en", "km"];
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      pathWithoutLocale = pathname.substring(`/${locale}`.length);
      currentLocale = locale;
      hasLocaleInPath = true;
      break;
    } else if (pathname === `/${locale}`) {
      pathWithoutLocale = "/";
      currentLocale = locale;
      hasLocaleInPath = true;
      break;
    }
  }

  const protectedPaths = ["/dashboard", "/profile", "/warehouse"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathWithoutLocale.startsWith(path),
  );

  // Add admin routes to protected paths
  const isAdminPath = pathWithoutLocale.startsWith("/admin");
  const isCompaniesPath = pathWithoutLocale.startsWith("/companies");
  const isCompaniesLoginPath = pathWithoutLocale === "/companies/login";

  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some((path) => pathWithoutLocale === path);

  if (!hasLocaleInPath && (isProtectedPath || isAuthPath || isCompaniesPath || isAdminPath)) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}${pathname}`, req.url),
    );
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && authToken) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}/admin`, req.url),
    );
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedPath || isAdminPath) {
    if (!authToken) {
      const loginUrl = new URL(`/${currentLocale}/login`, req.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
