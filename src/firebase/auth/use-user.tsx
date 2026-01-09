
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, getAdditionalUserInfo } from 'firebase/auth';
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
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        
        // The logic to create a user doc on first sign-in is now handled
        // more explicitly within the sign-in flows (handleGoogleSignIn, etc.)
        // to prevent race conditions and internal Firebase errors.
        // We can keep a check here as a fallback, but the primary creation
        // logic is now at the point of sign-up/sign-in.
        if (firestore) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
             // This might run for email sign-ups or if the Google sign-in check fails.
             const userData = {
                name: user.displayName,
                email: user.email,
                createdAt: serverTimestamp(),
            };
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, loading };
}
