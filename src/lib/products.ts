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
  query,
  orderBy,
  limit,
  startAfter,
  Query,
  DocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import type { Product } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getStorage, ref, deleteObject } from 'firebase/storage';

export function getProductsCollection(db: Firestore) {
  return collection(db, 'products');
}

export async function getPaginatedProducts(
  db: Firestore,
  direction: 'next' | 'prev',
  cursor: DocumentSnapshot<DocumentData, DocumentData> | null,
  pageSize: number
): Promise<{ products: Product[], newCursor: DocumentSnapshot<DocumentData, DocumentData> | null }> {
  const productsCollection = getProductsCollection(db);
  let productsQuery: Query;

  const baseQuery = query(productsCollection, orderBy('name', 'asc'));

  if (direction === 'next') {
    if (cursor) {
      productsQuery = query(baseQuery, startAfter(cursor), limit(pageSize));
    } else {
      productsQuery = query(baseQuery, limit(pageSize));
    }
  } else { // 'prev'
    // For 'prev', we need to reverse the query, get the docs, then reverse the result array.
    // This is a Firestore limitation.
    const prevBaseQuery = query(productsCollection, orderBy('name', 'desc'));
    if (cursor) {
      productsQuery = query(prevBaseQuery, startAfter(cursor), limit(pageSize));
    } else {
      // This case should ideally not happen if 'prev' is disabled on page 1
      productsQuery = query(prevBaseQuery, limit(pageSize));
    }
  }

  const snapshot = await getDocs(productsQuery);
  const products = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));

  if (direction === 'prev') {
    products.reverse(); // Reverse the array to get the correct order
  }

  const newCursor = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { products, newCursor };
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

    if (originalProduct && originalProduct.imageUrls && productData.imageUrls) {
        const storage = getStorage();
        // This logic is now safer: only delete images that are in the original list but NOT in the new list.
        const urlsToDelete = originalProduct.imageUrls.filter(url => !productData.imageUrls!.includes(url));
        
        const deletePromises = urlsToDelete.map(url => {
            try {
                const imageRef = ref(storage, url);
                return deleteObject(imageRef);
            } catch (error) {
                console.error(`Failed to create ref for deletion, possibly invalid URL: ${url}`, error);
                return Promise.resolve();
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

    if (product && product.imageUrls && product.imageUrls.length > 0) {
        const deletePromises = product.imageUrls.map(url => {
            try {
                 const imageRef = ref(storage, url);
                 return deleteObject(imageRef);
            }
            catch (error) {
                console.error(`Failed to create ref for deletion, possibly invalid URL: ${url}`, error);
                return Promise.resolve();
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

export async function seedDatabase(db: Firestore, productsToSeed: Omit<Product, 'id'>[]) {
    const productsCollection = getProductsCollection(db);
    const storage = getStorage();

    // 1. Get all existing products to delete them
    const existingProducts = await getProducts(db);
    
    // 2. Delete all existing images from storage
    if (existingProducts.length > 0) {
        const imageDeletePromises = existingProducts.flatMap(product => 
            product.imageUrls ? product.imageUrls.map(url => {
                try {
                    const imageRef = ref(storage, url);
                    return deleteObject(imageRef).catch(e => console.error(`Failed to delete image ${url}`, e)); // Catch errors per image
                } catch(e) {
                    console.log(`Could not create ref for ${url}`);
                    return Promise.resolve();
                }
            }) : []
        );
        await Promise.allSettled(imageDeletePromises);
    }
    
    // 3. Delete all existing documents from Firestore
    if (existingProducts.length > 0) {
        const deleteBatch = writeBatch(db);
        existingProducts.forEach(p => deleteBatch.delete(doc(db, 'products', p.id)));
        await deleteBatch.commit();
    }
    
    // 4. Add new products one by one
    const addPromises = productsToSeed.map(product => {
        return addProduct(db, product).catch(e => {
            console.error("Failed to add product:", product.name, e);
            // We'll let it continue to try and seed the rest
            return null;
        });
    });

    return Promise.all(addPromises);
}
