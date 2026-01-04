'use client';

import { ReactNode } from 'react';
import { initializeFirebase, FirebaseProvider }from '@/firebase';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, auth, firestore } = initializeFirebase();

  return (
    <FirebaseProvider value={{ app, auth, firestore }}>
      {children}
    </FirebaseProvider>
  );
}
