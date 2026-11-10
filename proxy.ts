import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('optifiber_token')?.value;
  const { pathname } = request.nextUrl;

  // Si está autenticado e intenta ir a login o register, redirigir al dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/mapa/:path*',
    '/naps/:path*',
    '/mufas/:path*',
    '/clientes/:path*',
    '/reservas/:path*',
    '/reportes/:path*',
    '/configuracion/:path*',
    '/login',
    '/register',
  ],
};
