'use client';

import {
  signOut as firebaseSignOut,
  type Auth,
} from 'firebase/auth';

export const signOut = async (auth: Auth) => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};
