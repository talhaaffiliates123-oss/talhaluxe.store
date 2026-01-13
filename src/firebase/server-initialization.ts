
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config'; // Reuse client-side config for project details

// This is a server-side only initialization for Firebase Admin SDK.
// It's used in Server Components and API routes for direct database access.

interface FirebaseAdminInstances {
  app: FirebaseApp;
  firestore: Firestore;
}

let instances: FirebaseAdminInstances | null = null;

function initializeFirebaseAdmin(): FirebaseAdminInstances {
  if (!instances) {
    if (!getApps().length) {
      const app = initializeApp({
          // Using projectId from client config is safe and standard
          projectId: firebaseConfig.projectId, 
      });
      const firestore = getFirestore(app);
      instances = { app, firestore };
    } else {
      const app = getApp();
      const firestore = getFirestore(app);
      instances = { app, firestore };
    }
  }
  return instances;
}

// Export a function to get the firestore instance
export function getFirebaseAdmin() {
  return initializeFirebaseAdmin();
}

// Legacy export for any files that might still use it directly
export const { firestore, app } = initializeFirebaseAdmin();
