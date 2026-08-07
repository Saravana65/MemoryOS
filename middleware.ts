import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is trying to access any dashboard path
  if (pathname.startsWith('/dashboard')) {
    const isAuthenticated = request.cookies.get('isAuthenticated')?.value;

    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      if (pathname !== '/dashboard') {
        url.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from login/register to dashboard
  if (pathname === '/login' || pathname === '/register') {
    const isAuthenticated = request.cookies.get('isAuthenticated')?.value;
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
