
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '../errors';

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is not yet available, don't do anything.
    // The hook will re-run when the auth object becomes available.
    if (!auth) {
      return;
    }

    // Auth is available, so we can set up the listener.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is authenticated, now check/create their profile.
        if (firestore) {
          const userDocRef = doc(firestore, 'users', user.uid);
          try {
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
              // User document doesn't exist, so create it.
              const userData = {
                name: user.displayName,
                email: user.email,
                createdAt: serverTimestamp(),
              };
              // Wait for the document to be created before proceeding.
              await setDoc(userDocRef, userData);
            }
          } catch (e: any) {
            // This catch block handles errors from getDoc or setDoc.
            console.error("Error managing user document in useUser hook:", e);
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'get/create',
            });
            errorEmitter.emit('permission-error', permissionError);
            // Even if Firestore fails, we still have an auth user.
            // Let the app proceed instead of getting stuck.
          }
        }
        // Finally, set the user state and stop loading.
        setUser(user);
        setLoading(false);
      } else {
        // User is not authenticated.
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, loading };
}
