import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import admin from '../lib/firebase-admin';

export async function createUser(userData) {
  try {
    // Validate required fields
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    // Create the user in Firebase Authentication
    const userRecord = await getAuth().createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName || '',
    });

    // Create the user document in Firestore
    const userDoc = {
      uid: userRecord.uid,
      email: userData.email,
      displayName: userData.displayName || '',
      role: userData.role || 'User',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userData.createdBy,
    };

    const db = getFirestore();
    await db.collection('users').doc(userRecord.uid).set(userDoc);

    return { success: true, user: userRecord };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteUser(uid) {
  try {
    if (!uid) {
      throw new Error('User ID is required');
    }

    const auth = getAuth();
    const db = getFirestore();

    // Delete from Firebase Authentication
    await auth.deleteUser(uid);
    
    // Delete from Firestore
    await db.collection('users').doc(uid).delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
} 