import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/config/firebase-admin';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // Return early if no session exists
  if (!session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);

    // Check if the session is revoked
    const user = await adminAuth.getUser(decodedClaims.uid);
    
    if (user.disabled) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If there's an error, clear the session cookie and redirect to login
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Add the paths that need authentication
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/contacts/:path*',
    '/settings/:path*'
  ]
}; 