import { NextResponse } from 'next/server';
import { auth, db } from '@/config/firebase-admin';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const contactData = await request.json();

    const contactId = await db.addContact(contactData);
    return NextResponse.json({ id: contactId }, { status: 201 });
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

    let contacts;
    if (departmentId) {
      contacts = await db.getContactsByDepartment(departmentId);
    } else if (instituteId) {
      contacts = await db.getContactsByInstitute(instituteId);
    } else {
      // Get all contacts
      contacts = await db.getAllContacts();
    }

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 