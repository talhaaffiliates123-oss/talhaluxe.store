'use client';

import {
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
  getRedirectResult,
  type Auth,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (auth: Auth) => {
  // Using signInWithRedirect to avoid popup issues.
  // The result is handled on page load by getRedirectResult.
  try {
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.error('Error starting Google sign-in redirect:', error.message);
    throw error;
  }
};

export const handleRedirectResult = async (auth: Auth) => {
    try {
        const result = await getRedirectResult(auth);
        return result;
    } catch (error: any) {
        console.error('Error getting redirect result:', error.message);
        throw error;
    }
}

export const signOut = async (auth: Auth) => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};
