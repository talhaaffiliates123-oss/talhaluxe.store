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

export const handleGoogleRedirectResult = async (auth: Auth | null) => {
    // This should be called on the page the user is redirected back to.
    // It resolves with the user credential or null if there was no redirect.
    if (!auth) {
        // This is not an error, it just means Firebase isn't ready.
        // The calling function should handle this by waiting.
        return null;
    }
    try {
        const result = await getRedirectResult(auth);
        return result?.user ?? null;
    } catch (error: any) {
        console.error('Error handling Google redirect result:', error.message);
        // This can happen for various reasons, e.g., user closes the popup,
        // network error, etc. We re-throw so the calling UI can handle it.
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
