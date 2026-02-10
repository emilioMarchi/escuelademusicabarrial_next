import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Solo nos importa proteger lo que empiece con /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Aquí podrías chequear una cookie de sesión si la tuvieras.
    // Por ahora, Next.js permite que la página cargue y el Layout haga el resto.
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};