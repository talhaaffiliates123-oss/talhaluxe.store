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
  try {
    // We are now using signInWithRedirect which is more reliable than signInWithPopup
    await signInWithRedirect(auth, provider);
    // The rest of the logic will be handled on the page that receives the redirect
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
