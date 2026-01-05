'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type Auth,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (auth: Auth) => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error('Error during Google sign-in popup:', error.message);
    throw error;
  }
};

export const signOut = async (auth: Auth) => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};
