'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import type { FirebaseContextValue } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    const { app, auth, firestore } = initializeFirebase();
    setFirebase({ app, auth, firestore });
  }, []);

  if (!firebase) {
    // You can render a loading spinner here if needed
    return null;
  }

  return (
    <FirebaseProvider value={firebase}>
      {children}
    </FirebaseProvider>
  );
}
