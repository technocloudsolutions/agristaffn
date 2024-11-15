import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './service-account.json';

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
    projectId: serviceAccount.project_id,
  });
}

const auth = getAuth();
const db = getFirestore();

export { auth, db }; 