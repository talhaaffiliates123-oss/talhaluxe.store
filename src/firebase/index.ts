'use client';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import {
  getAuth,
  Auth,
} from 'firebase/auth';
import { getMessaging, Messaging } from "firebase/messaging";
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';
import { FirebaseClientProvider } from './client-provider';

import {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useStorage,
  useMessaging
} from './provider';

// This function should only be called on the client side.
function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      const storage = getStorage(app);
      const messaging = getMessaging(app);
      return { app, auth, firestore, storage, messaging };
    } else {
      const app = getApp();
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      const storage = getStorage(app);
      let messaging: Messaging | null = null;
      try {
        messaging = getMessaging(app);
      } catch (e) {
        // This can happen with HMR, it's usually safe to ignore
      }
      return { app, auth, firestore, storage, messaging };
    }
  }
  // Return nulls for server-side rendering
  return { app: null, auth: null, firestore: null, storage: null, messaging: null };
}

export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useCollection,
  useDoc,
  useUser,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useStorage,
  useMessaging,
};
