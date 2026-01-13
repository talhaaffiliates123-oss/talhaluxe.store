
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config'; // Reuse client-side config for project details

// This is a server-side only initialization for Firebase Admin SDK.
// It's used in Server Components and API routes for direct database access.

let app: FirebaseApp;
let firestore: Firestore;

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    app = initializeApp({
        // Using projectId from client config is safe and standard
        projectId: firebaseConfig.projectId, 
    });
  } else {
    app = getApp();
  }
  firestore = getFirestore(app);
  return { app, firestore };
}

// Export a single instance to be used across the server-side of the app.
export const { firestore: serverFirestore, app: serverApp } = initializeFirebaseAdmin();

// We can also export the function if granular initialization is needed elsewhere.
export { initializeFirebaseAdmin as initializeFirebase };
