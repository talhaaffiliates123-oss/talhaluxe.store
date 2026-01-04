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
  writeBatch,
} from 'firebase/firestore';
import type { Product } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getStorage, ref, deleteObject } from 'firebase/storage';

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
    return addDoc(productsCollection, productData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: productsCollection.path,
          operation: 'create',
          requestResourceData: productData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}

export async function updateProduct(db: Firestore, id: string, productData: Partial<Omit<Product, 'id'>>) {
    const docRef = doc(db, 'products', id);
    const originalProduct = await getProduct(db, id);

    // This logic is flawed. We should not delete images that are still in use.
    // The user might just be adding new images. The form logic now replaces URLs.
    // Let's adjust this to only delete images that are NO LONGER in the productData.imageUrls array.
    if (originalProduct && originalProduct.imageUrls && productData.imageUrls) {
        const storage = getStorage();
        const urlsToDelete = originalProduct.imageUrls.filter(url => !productData.imageUrls!.includes(url));
        
        const deletePromises = urlsToDelete.map(url => {
            try {
                const imageRef = ref(storage, url);
                return deleteObject(imageRef);
            } catch (error) {
                console.error(`Failed to create ref for deletion, possibly invalid URL: ${url}`, error);
                return Promise.resolve(); // Don't block update if deletion fails for one image
            }
        });
        await Promise.all(deletePromises).catch(err => console.error("Error deleting one or more images from storage", err));
    }


    return updateDoc(docRef, productData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: productData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}

export async function deleteProduct(db: Firestore, id: string) {
    const docRef = doc(db, 'products', id);
    const product = await getProduct(db, id);
    const storage = getStorage();

    // Also delete associated images from storage
    if (product && product.imageUrls && product.imageUrls.length > 0) {
        const deletePromises = product.imageUrls.map(url => {
            try {
                 const imageRef = ref(storage, url);
                 return deleteObject(imageRef);
            }
            catch (error) {
                console.error(`Failed to create ref for deletion, possibly invalid URL: ${url}`, error);
                return Promise.resolve(); // Don't block deletion if one image fails
            }
        });
        await Promise.all(deletePromises).catch(err => console.error("Error deleting one or more images from storage", err));
    }

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

// A function to seed the database, which also needs to delete old images if any
export async function seedDatabase(db: Firestore, productsToSeed: Omit<Product, 'id'>[]) {
    const productsCollection = getProductsCollection(db);
    const storage = getStorage();

    // 1. Get all existing products to delete their images
    const existingProducts = await getProducts(db);
    const imageDeletePromises: Promise<void>[] = [];
    existingProducts.forEach(product => {
        if (product.imageUrls) {
            product.imageUrls.forEach(url => {
                try {
                    const imageRef = ref(storage, url);
                    imageDeletePromises.push(deleteObject(imageRef));
                } catch(e) {
                    console.log(`Could not create ref for ${url}`);
                }
            });
        }
    });

    // 2. Delete all existing documents in the collection
    const docDeletePromises: Promise<void>[] = existingProducts.map(p => deleteDoc(doc(db, 'products', p.id)));

    // Execute all deletions
    await Promise.allSettled([...imageDeletePromises, ...docDeletePromises]);

    // 3. Add new products
    const batch = writeBatch(db);
    productsToSeed.forEach(product => {
        const newDocRef = doc(productsCollection);
        batch.set(newDocRef, product);
    });

    return batch.commit();
}
