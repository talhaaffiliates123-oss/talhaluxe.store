'use client';

import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  type Auth,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (auth: Auth) => {
  // This initiates the redirect flow.
  // Firebase handles the temporary state and brings the user back.
  try {
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.error('Error starting Google sign-in redirect:', error.message);
    throw error;
  }
};

export const handleGoogleRedirectResult = (auth: Auth) => {
    // This should be called on the page the user is redirected back to.
    // It resolves with the user credential or null if there was no redirect.
    // We return the promise directly to be handled by the caller.
    return getRedirectResult(auth);
}

export const signOut = async (auth: Auth) => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};
