'use client';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  Auth,
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

const provider = new GoogleAuthProvider();

export const getFirebaseAuth = (): Auth => {
  const { auth } = initializeFirebase();
  if (!auth) {
    throw new Error('Firebase Auth has not been initialized.');
  }
  return auth;
};

export const signInWithGoogle = async () => {
  const auth = getFirebaseAuth();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  const auth = getFirebaseAuth();
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
