
import * as admin from 'firebase-admin';

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let app: admin.app.App | null = null;
let firestore: admin.firestore.Firestore | null = null;

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    throw new Error("This function should only be called on the server.");
  }
  
  if (!admin.apps.length) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firestore = admin.firestore();
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('Firebase Admin SDK initialization error:', error.stack);
      // Don't throw here, just log the error. The app will continue without server-side Firebase.
    }
  } else {
    app = admin.app();
    firestore = admin.firestore();
  }

  return { app, firestore };
}
