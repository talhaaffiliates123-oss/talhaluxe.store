
'use client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  Firestore,
  query,
  orderBy,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import type { Deal } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function getDealsCollection(db: Firestore) {
  return collection(db, 'deals');
}

export async function getDeals(db: Firestore): Promise<Deal[]> {
  const dealsCollection = getDealsCollection(db);
  const q = query(dealsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as Deal)
  );
}

export async function getActiveDeals(db: Firestore): Promise<Deal[]> {
    const dealsCollection = getDealsCollection(db);
    const q = query(dealsCollection, where('isActive', '==', true), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Deal)
    );
}

export async function getDeal(
  db: Firestore,
  id: string
): Promise<Deal | null> {
  const docRef = doc(db, 'deals', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { ...snapshot.data(), id: snapshot.id } as Deal;
  }
  return null;
}

export function addDeal(db: Firestore, dealData: Omit<Deal, 'id' | 'createdAt'>) {
    const dealsCollection = getDealsCollection(db);
    const finalData = { ...dealData, createdAt: serverTimestamp() };
    return addDoc(dealsCollection, finalData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: dealsCollection.path,
          operation: 'create',
          requestResourceData: finalData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}

export async function updateDeal(db: Firestore, id: string, dealData: Partial<Omit<Deal, 'id' | 'createdAt'>>) {
    const docRef = doc(db, 'deals', id);
    return updateDoc(docRef, dealData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: dealData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}


export async function deleteDeal(db: Firestore, id: string) {
    const docRef = doc(db, 'deals', id);
    return deleteDoc(docRef)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}
