
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
        setUser(user);
        
        if (firestore) {
          const userDocRef = doc(firestore, 'users', user.uid);
          // Check if user profile exists before trying to create it.
          // This avoids unnecessary writes on every auth state change.
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
             const userData = {
                name: user.displayName,
                email: user.email,
                createdAt: serverTimestamp(),
            };
            // Set the document only if it doesn't exist.
            setDoc(userDocRef, userData, { merge: true })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'create',
                    requestResourceData: userData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
          }
        }
      } else {
        setUser(null);
      }
      // Only set loading to false after the auth state has been determined.
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, loading };
}
