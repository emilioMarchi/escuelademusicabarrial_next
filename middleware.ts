import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const requestUrl = request.nextUrl.clone();

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isLoginRoute = request.nextUrl.pathname === '/login';

  // Si no hay cookie y se intenta acceder al dashboard, redirigir a /login
  if (isDashboardRoute && !sessionCookie) {
    requestUrl.pathname = '/login';
    return NextResponse.redirect(requestUrl);
  }

  // Si hay cookie y se intenta acceder a /login, redirigir al dashboard
  if (isLoginRoute && sessionCookie) {
    requestUrl.pathname = '/dashboard';
    return NextResponse.redirect(requestUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};