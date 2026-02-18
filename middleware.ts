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

  // Si hay cookie pero parece inválida (muy corta o malformada), redirigir con aviso.
  // Nota: el Edge Runtime no puede verificar la firma JWT de Firebase,
  // eso lo hace verifyAdminAccess() en cada Server Action.
  // Aquí solo hacemos una validación superficial de formato.
  if (isDashboardRoute && sessionCookie) {
    const parts = sessionCookie.split('.');
    if (parts.length !== 3) {
      // Cookie con formato inválido (no es un JWT): limpiarla y redirigir
      requestUrl.pathname = '/login';
      requestUrl.searchParams.set('error', 'session_invalid');
      const response = NextResponse.redirect(requestUrl);
      response.cookies.delete('session');
      return response;
    }
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
