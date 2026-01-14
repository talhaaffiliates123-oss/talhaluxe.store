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

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let messaging: Messaging | null = null;


function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        firestore = getFirestore(app);
        storage = getStorage(app);
        messaging = getMessaging(app);
      } catch (e) {
        console.error('Failed to initialize Firebase', e);
      }
    } else {
      app = getApp();
      auth = getAuth(app);
      firestore = getFirestore(app);
      storage = getStorage(app);
      // Messaging might not be initialized if getApps().length > 0 but it wasn't initialized before.
      try {
        messaging = getMessaging(app);
      } catch (e) {
        // This can happen with HMR, it's usually safe to ignore
      }
    }
  }
  return { app, auth, firestore, storage, messaging };
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
