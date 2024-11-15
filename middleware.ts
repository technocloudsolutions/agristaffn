import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // Return early if no session exists
  if (!session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Verify session using an API route instead of direct Firebase Admin usage
    const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${session}`
      }
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If there's an error, redirect to login
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/contacts/:path*',
    '/settings/:path*'
  ]
}; 