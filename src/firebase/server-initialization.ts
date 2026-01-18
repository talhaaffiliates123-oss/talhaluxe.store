
// import * as admin from 'firebase-admin';

// This function should only be called on the server.
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    throw new Error('This function should only be called on the server.');
  }

  // This functionality is disabled because environment keys were removed.
  throw new Error('Firebase Admin SDK is not configured. Please add FIREBASE_SERVICE_ACCOUNT to your environment variables to enable server-side rendering.');
}
