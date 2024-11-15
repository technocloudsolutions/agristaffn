import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/config/firebase-admin';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  if (!session && !request.nextUrl.pathname.startsWith('/')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (session && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
  ],
}; 