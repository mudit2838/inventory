import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;

  if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register') || request.nextUrl.pathname.startsWith('/api/auth')) {
    if (isAuthenticated && request.nextUrl.pathname !== '/dashboard') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/api/products') || request.nextUrl.pathname.startsWith('/api/sales') || request.nextUrl.pathname.startsWith('/api/customers')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/products/:path*', '/api/sales/:path*', '/api/customers/:path*', '/login', '/register'],
};