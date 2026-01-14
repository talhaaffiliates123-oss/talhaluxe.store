
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import type { FirebaseContextValue } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    // This effect runs only once on the client
    const { app, auth, firestore, storage, messaging } = initializeFirebase();
    if (app && auth && firestore && storage) {
      setFirebase({ app, auth, firestore, storage, messaging });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Render children immediately, Firebase will be available through context once initialized.
  // Components that need Firebase should handle the null state until it's ready.
  return (
    <FirebaseProvider value={firebase!}>
      {children}
    </FirebaseProvider>
  );
}
