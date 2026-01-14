import type { Firestore } from 'firebase-admin/firestore';
import type { Product } from './types';

/**
 * Fetches all products from Firestore using the Firebase Admin SDK.
 * This function is intended for server-side use only.
 * @param db The Firestore instance from the Firebase Admin SDK.
 * @returns A promise that resolves to an array of products.
 */
export async function getProductsForServer(db: Firestore): Promise<Product[]> {
  const productsCollection = db.collection('products');
  const snapshot = await productsCollection.get();
  
  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => {
    const data = doc.data();
    // Convert Firestore Timestamps to serializable format if they exist
    // This is good practice for Server Component props.
    const product: Product = {
      ...data,
      id: doc.id,
      // Ensure any Timestamp fields are converted if you add them later
      // e.g., createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    } as Product;
    return product;
  });
}
