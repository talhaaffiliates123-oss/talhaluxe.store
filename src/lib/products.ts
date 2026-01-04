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
    const prevBaseQuery = query(productsCollection, orderBy('name', 'desc'));
    if (cursor) {
      productsQuery = query(prevBaseQuery, startAfter(cursor), limit(pageSize));
    } else {
      productsQuery = query(prevBaseQuery, limit(pageSize));
    }
  }

  const snapshot = await getDocs(productsQuery);
  const products = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));

  if (direction === 'prev') {
    products.reverse();
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

export async function updateProduct(db: Firestore, id: string, productData: Partial<Product>) {
    const docRef = doc(db, 'products', id);
    const originalProduct = await getProduct(db, id);

    if (originalProduct && originalProduct.imageUrls) {
        const newUrls = productData.imageUrls || [];
        const urlsToDelete = originalProduct.imageUrls.filter(url => !newUrls.includes(url));
        
        if(urlsToDelete.length > 0) {
            const storage = getStorage();
            const deletePromises = urlsToDelete.map(url => {
                try {
                    if (url.includes('firebasestorage.googleapis.com')) {
                        const imageRef = ref(storage, url);
                        return deleteObject(imageRef);
                    }
                    return Promise.resolve();
                } catch (error) {
                    console.error(`Failed to create ref for deletion: ${url}`, error);
                    return Promise.resolve();
                }
            });
            await Promise.all(deletePromises).catch(err => console.error("Error deleting images", err));
        }
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
                 if (url.includes('firebasestorage.googleapis.com')) {
                    const imageRef = ref(storage, url);
                    return deleteObject(imageRef);
                 }
                 return Promise.resolve();
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

    const existingProducts = await getProducts(db);
    
    if (existingProducts.length > 0) {
        const imageDeletePromises = existingProducts.flatMap(product => 
            product.imageUrls ? product.imageUrls.map(url => {
                try {
                     if (url.includes('picsum.photos')) return Promise.resolve();
                    const imageRef = ref(storage, url);
                    return deleteObject(imageRef).catch(e => console.error(`Failed to delete image ${url}`, e));
                } catch(e) {
                    console.log(`Could not create ref for ${url}`);
                    return Promise.resolve();
                }
            }) : []
        );
        await Promise.allSettled(imageDeletePromises);
    }
    
    if (existingProducts.length > 0) {
        const deleteBatch = writeBatch(db);
        existingProducts.forEach(p => deleteBatch.delete(doc(db, 'products', p.id)));
        await deleteBatch.commit();
    }
    
    const addBatch = writeBatch(db);
    productsToSeed.forEach(product => {
      const newDocRef = doc(productsCollection);
      addBatch.set(newDocRef, product);
    });

    return addBatch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: productsCollection.path,
          operation: 'create',
          requestResourceData: { note: "Batch write for seeding failed."}
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
