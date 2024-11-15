import { auth } from '@/config/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to list users as a test
    const listUsersResult = await auth.listUsers(1);
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase Admin SDK initialized successfully',
      userCount: listUsersResult.users.length 
    });
  } catch (error) {
    console.error('Firebase Admin initialization test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 