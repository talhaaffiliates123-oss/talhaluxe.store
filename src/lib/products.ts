
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

export function getProductsCollection(db: Firestore) {
  return collection(db, 'products');
}

export async function getPaginatedProducts(
  db: Firestore,
  direction: 'next' | 'initial' = 'initial',
  lastVisible: DocumentSnapshot<DocumentData, DocumentData> | null = null,
  pageSize: number = 10
): Promise<{ products: Product[], newCursor: DocumentSnapshot<DocumentData, DocumentData> | null, isLastPage: boolean }> {
  const productsCollection = getProductsCollection(db);
  let productsQuery: Query;

  const baseQuery = query(productsCollection, orderBy('name', 'asc'));

  if (direction === 'next' && lastVisible) {
      productsQuery = query(baseQuery, startAfter(lastVisible), limit(pageSize));
  } else {
      productsQuery = query(baseQuery, limit(pageSize));
  }
  
  const snapshot = await getDocs(productsQuery);
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

  const newCursor = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  const isLastPage = snapshot.docs.length < pageSize;

  return { products, newCursor, isLastPage };
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
    // Auto-calculate stock from variants
    const hasVariants = productData.variants && productData.variants.length > 0;
    const totalStock = hasVariants
        ? productData.variants!.reduce((sum, v) => sum + v.stock, 0)
        : productData.stock ?? 0;

    const variantImageUrls = productData.variants?.map(v => v.imageUrl).filter(Boolean) as string[] || [];
    const combinedImageUrls = [...new Set([...productData.imageUrls, ...variantImageUrls])];

    const finalProductData = { ...productData, stock: totalStock, imageUrls: combinedImageUrls };

    return addDoc(productsCollection, finalProductData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: productsCollection.path,
          operation: 'create',
          requestResourceData: finalProductData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}

export async function updateProduct(db: Firestore, id: string, productData: Partial<Product>) {
    const docRef = doc(db, 'products', id);

    // Auto-calculate stock from variants if they are part of the update
    const hasVariants = productData.variants && productData.variants.length > 0;
    const totalStock = hasVariants
      ? productData.variants!.reduce((sum, v) => sum + v.stock, 0)
      : productData.stock;
    
    const variantImageUrls = productData.variants?.map(v => v.imageUrl).filter(Boolean) as string[] || [];
    const combinedImageUrls = [...new Set([...(productData.imageUrls || []), ...variantImageUrls])];

    const finalProductData = { ...productData, stock: totalStock, imageUrls: combinedImageUrls };


    return updateDoc(docRef, finalProductData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: finalProductData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}


export async function deleteProduct(db: Firestore, id: string) {
    const docRef = doc(db, 'products', id);
   
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
