'use client';

import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  type Auth,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (auth: Auth, redirectUrl?: string) => {
  try {
    if (redirectUrl) {
      // If a specific redirect URL is provided, you might need to handle it
      // carefully, but for this flow, Firebase handles it via its own mechanism
      // post-sign-in. The important part is initiating the redirect from the
      // correct user action.
    }
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.error('Error starting Google sign-in redirect:', error.message);
    throw error;
  }
};

export const handleGoogleRedirectResult = async (auth: Auth) => {
    try {
        const result = await getRedirectResult(auth);
        return result?.user ?? null;
    } catch (error: any) {
        console.error('Error handling Google redirect result:', error.message);
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
