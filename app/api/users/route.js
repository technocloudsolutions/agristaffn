import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import admin from '../../../lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const auth = getAuth();
    const db = getFirestore();

    // Get all users from Authentication
    const { users } = await auth.listUsers();
    
    // Get additional user data from Firestore
    const usersSnapshot = await db.collection('users').get();
    const firestoreUsers = {};
    usersSnapshot.forEach(doc => {
      firestoreUsers[doc.id] = doc.data();
    });

    // Combine Auth and Firestore data
    const combinedUsers = users.map(user => ({
      ...user,
      ...firestoreUsers[user.uid],
    }));

    return NextResponse.json({ success: true, users: combinedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userData = await request.json();
    const { 
      email, 
      password, 
      fullName,
      designation,
      departmentId,
      instituteId,
      unitId,
      contactNumber,
      role,
      profilePicture,
      isActive 
    } = userData;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    // Create user in Firebase Auth
    const auth = getAuth();
    const authUserData = {
      email,
      password,
      displayName: fullName || '',
      disabled: !isActive,
    };

    // Only add photoURL if it's a valid URL
    if (profilePicture && (profilePicture.startsWith('http') || profilePicture.startsWith('data:image'))) {
      // If it's a base64 image, we need to upload it to Firebase Storage first
      if (profilePicture.startsWith('data:image')) {
        const bucket = admin.storage().bucket();
        const fileName = `profile-pictures/${Date.now()}-${email.split('@')[0]}.jpg`;
        
        // Convert base64 to buffer
        const base64EncodedImageString = profilePicture.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
        
        // Upload to Firebase Storage
        const file = bucket.file(fileName);
        await file.save(imageBuffer, {
          metadata: {
            contentType: 'image/jpeg'
          }
        });
        
        // Make the file public and get URL
        await file.makePublic();
        authUserData.photoURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      } else {
        authUserData.photoURL = profilePicture;
      }
    }

    const userRecord = await auth.createUser(authUserData);

    // Create user document in Firestore
    const db = getFirestore();
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      fullName: fullName || '',
      designation: designation || '',
      departmentId: departmentId || '',
      instituteId: instituteId || '',
      unitId: unitId || '',
      contactNumber: contactNumber || '',
      role: role || 'User',
      profilePicture: authUserData.photoURL || '',
      isActive: isActive ?? true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ 
      success: true, 
      user: userRecord 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const userData = await request.json();
    const { 
      uid, 
      email, 
      fullName,
      designation,
      departmentId,
      instituteId,
      unitId,
      contactNumber,
      role,
      profilePicture,
      isActive 
    } = userData;

    if (!uid) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const auth = getAuth();
    const db = getFirestore();

    // Update Auth user
    const authUpdateData = {
      email: email,
      displayName: fullName,
      disabled: !isActive,
    };

    // Handle profile picture update
    if (profilePicture) {
      if (profilePicture.startsWith('data:image')) {
        const bucket = admin.storage().bucket();
        const fileName = `profile-pictures/${Date.now()}-${email.split('@')[0]}.jpg`;
        
        // Convert base64 to buffer
        const base64EncodedImageString = profilePicture.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
        
        // Upload to Firebase Storage
        const file = bucket.file(fileName);
        await file.save(imageBuffer, {
          metadata: {
            contentType: 'image/jpeg'
          }
        });
        
        // Make the file public and get URL
        await file.makePublic();
        authUpdateData.photoURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      } else if (profilePicture.startsWith('http')) {
        authUpdateData.photoURL = profilePicture;
      }
    }

    await auth.updateUser(uid, authUpdateData);

    // Update Firestore user
    await db.collection('users').doc(uid).update({
      email,
      fullName: fullName || '',
      designation: designation || '',
      departmentId: departmentId || '',
      instituteId: instituteId || '',
      unitId: unitId || '',
      contactNumber: contactNumber || '',
      role: role || 'User',
      profilePicture: authUpdateData.photoURL || '',
      isActive: isActive ?? true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const auth = getAuth();
    const db = getFirestore();

    // Delete from Authentication
    await auth.deleteUser(uid);
    
    // Delete from Firestore
    await db.collection('users').doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 