import { NextResponse } from 'next/server';
import { adminAuth } from '@/config/firebase-admin';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(token, true);
    const user = await adminAuth.getUser(decodedClaims.uid);
    
    if (user.disabled) {
      return NextResponse.json({ error: 'Account disabled' }, { status: 403 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
} 