
import * as admin from 'firebase-admin';

// This function should only be called on the server.
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    throw new Error('This function should only be called on the server.');
  }

  // Check if the app is already initialized
  if (admin.apps.length > 0) {
    return { 
        app: admin.app(), 
        firestore: admin.firestore() 
    };
  }

  // Check for necessary environment variables
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Firebase Admin SDK service account credentials are not set in environment variables. Please check FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and NEXT_PUBLIC_FIREBASE_PROJECT_ID.');
  }

  try {
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
