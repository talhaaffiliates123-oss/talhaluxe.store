
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  collection,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function useCollection<T extends DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    // Do not proceed if firestore or the query is not ready
    if (!firestore || !query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useCollection error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // We stringify the query to create a stable dependency for the useEffect hook.
  // We also depend on the firestore instance itself.
  }, [firestore, query ? JSON.stringify(query) : 'null']);

  return { data, loading, error };
}
