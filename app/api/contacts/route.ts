import { NextResponse } from 'next/server';
import { adminAuth as auth, adminDb as db } from '@/config/firebase-admin';
import { CollectionReference, Query, DocumentData } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const contactData = await request.json();

    // Add contact to Firestore
    const docRef = await db.collection('contacts').add({
      ...contactData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department');
    const instituteId = searchParams.get('institute');

    let contactsRef: CollectionReference | Query = db.collection('contacts');
    
    if (departmentId) {
      contactsRef = (contactsRef as CollectionReference).where('departmentId', '==', departmentId);
    } else if (instituteId) {
      contactsRef = (contactsRef as CollectionReference).where('instituteId', '==', instituteId);
    }

    const snapshot = await contactsRef.get();
    const contacts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 