'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const { auth } = initializeFirebase();
  if (!auth) {
    throw new Error('Firebase Auth has not been initialized for signInWithGoogle.');
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  const { auth } = initializeFirebase();
   if (!auth) {
    throw new Error('Firebase Auth has not been initialized for signOut.');
  }
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
