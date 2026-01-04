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
} from 'firebase/firestore';
import type { Product } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function getProductsCollection(db: Firestore) {
  return collection(db, 'products');
}

export async function getProducts(db: Firestore): Promise<Product[]> {
  const productsCollection = getProductsCollection(db);
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as Product)
  );
}

export async function getProduct(
  db: Firestore,
  id: string
): Promise<Product | null> {
  const docRef = doc(db, 'products', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { ...snapshot.data(), id: snapshot.id } as Product;
  }
  return null;
}

export function addProduct(db: Firestore, productData: Omit<Product, 'id'>) {
    const productsCollection = getProductsCollection(db);
    // This MUST return the promise
    return addDoc(productsCollection, productData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: productsCollection.path,
          operation: 'create',
          requestResourceData: productData,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw the original error after logging
        throw serverError;
      });
}

export function updateProduct(db: Firestore, id: string, productData: Partial<Product>) {
    const docRef = doc(db, 'products', id);
    updateDoc(docRef, productData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: productData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
}

export function deleteProduct(db: Firestore, id: string) {
    const docRef = doc(db, 'products', id);
    deleteDoc(docRef)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
}
