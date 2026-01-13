
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  doc,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T extends DocumentData>(ref: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Do not proceed if the reference is not ready. This is the crucial fix.
    if (!ref) {
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
      async (err) => {
        console.error("useDoc error:", err);
        
        // Create and emit a contextual error for permission issues on get operations
        if (err.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: ref.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }

        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}
