
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  doc,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';


export function useDoc<T extends DocumentData>(ref: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    // Do not proceed if firestore or the reference is not ready
    if (!firestore || !ref) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useDoc error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // We stringify the ref path to create a stable dependency for the useEffect hook.
    // We also depend on the firestore instance itself.
  }, [firestore, ref ? ref.path : 'null']);

  return { data, loading, error };
}
