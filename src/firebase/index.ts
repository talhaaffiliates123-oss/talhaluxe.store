'use client';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  getAuth,
  Auth,
  initializeAuth,
  indexedDBLocalPersistence,
} from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';
import { FirebaseClientProvider } from './client-provider';
import { handleGoogleRedirectResult } from './auth';

import {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useStorage,
} from './provider';
import { FirestorePermissionError } from './errors';
import { errorEmitter } from './error-emitter';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Flag to ensure redirect handling only runs once
let isRedirectHandled = false;

function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
        auth = initializeAuth(app, {
          persistence: indexedDBLocalPersistence,
        });
        firestore = getFirestore(app);
        storage = getStorage(app);
      } catch (e) {
        console.error('Failed to initialize Firebase', e);
      }
    } else {
      app = getApp();
      if (!auth) {
        auth = initializeAuth(app, {
            persistence: indexedDBLocalPersistence,
        });
      }
      firestore = getFirestore(app);
      storage = getStorage(app);
    }

    if (auth && firestore && !isRedirectHandled) {
      isRedirectHandled = true;
      handleGoogleRedirectResult(auth)
        .then((result) => {
          if (result?.user && firestore) {
            const redirectUser = result.user;
            const userDocRef = doc(firestore, 'users', redirectUser.uid);
            const userData = {
              name: redirectUser.displayName,
              email: redirectUser.email,
              createdAt: serverTimestamp(),
            };
            
            // Create or update the user document in Firestore.
            setDoc(userDocRef, userData, { merge: true })
              .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                  path: userDocRef.path,
                  operation: 'create',
                  requestResourceData: userData,
                });
                errorEmitter.emit('permission-error', permissionError);
                console.error("Could not save user profile after redirect.", serverError);
              });
          }
        })
        .catch((error) => {
          console.error("Error handling Google redirect result:", error.message);
        });
    }
  }
  return { app, auth, firestore, storage };
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
};
