
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import type { FirebaseContextValue } from './provider';
import { Skeleton } from '@/components/ui/skeleton';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextValue | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // This effect runs only once on the client
    const { app, auth, firestore, storage } = initializeFirebase();
    if (app && auth && firestore && storage) {
      setFirebase({ app, auth, firestore, storage });
    }
    setIsInitializing(false);
  }, []); // Empty dependency array ensures this runs only once on mount

  if (isInitializing || !firebase) {
    // Render a skeleton layout or a loading spinner while Firebase is initializing
    // This prevents any child components from rendering until Firebase is ready.
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 p-4">
                <div className="container flex h-8 items-center">
                    <Skeleton className="h-6 w-32" />
                    <div className="ml-auto flex items-center gap-4">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>
            </header>
            <main className="flex-grow p-4">
                <div className="container">
                    <Skeleton className="h-[60vh] w-full" />
                </div>
            </main>
            <footer className="border-t bg-muted/40 p-8">
                 <div className="container">
                    <Skeleton className="h-24 w-full" />
                </div>
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
