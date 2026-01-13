'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import type { FirebaseContextValue } from './provider';
import { Skeleton } from '@/components/ui/skeleton';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    const { app, auth, firestore, storage } = initializeFirebase();
    setFirebase({ app, auth, firestore, storage });
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!firebase) {
    // Render a skeleton layout or a loading spinner while Firebase is initializing
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 p-4">
                <Skeleton className="h-8 w-full" />
            </header>
            <main className="flex-grow p-4">
                <Skeleton className="h-[60vh] w-full" />
            </main>
            <footer className="border-t bg-muted/40 p-4">
                 <Skeleton className="h-24 w-full" />
            </footer>
        </div>
    );
  }

  return (
    <FirebaseProvider value={firebase}>
      {children}
    </FirebaseProvider>
  );
}
