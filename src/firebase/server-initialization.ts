
import * as admin from 'firebase-admin';

// This function should only be called on the server.
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    throw new Error('This function should only be called on the server.');
  }

  // Check if the app is already initialized to prevent errors
  if (admin.apps.length > 0) {
    return { 
        app: admin.app(), 
        firestore: admin.firestore() 
    };
  }

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set. This is required for server-side operations.');
    }
    const serviceAccount = JSON.parse(serviceAccountJson);

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    const firestore = admin.firestore();
    console.log('Firebase Admin SDK initialized successfully.');
    return { app, firestore };
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
    // Re-throw the error to ensure the calling code knows initialization failed.
    throw new Error(`Firebase Admin SDK failed to initialize: ${error.message}`);
  }
}
