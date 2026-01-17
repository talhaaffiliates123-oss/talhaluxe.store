
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
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Firebase Admin SDK environment variables are not set. This is required for server-side operations.');
    }

    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines with actual newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

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
