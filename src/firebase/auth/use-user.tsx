
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
        
        if (firestore) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
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
