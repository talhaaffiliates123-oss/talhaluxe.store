'use client';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  runTransaction,
  doc,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import type { Review } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type NewReviewData = {
  rating: number;
  comment?: string;
  userId: string;
  userName: string;
};

// Get all reviews for a product
export async function getReviews(
  db: Firestore,
  productId: string
): Promise<Review[]> {
  const reviewsCollection = collection(db, 'products', productId, 'reviews');
  const q = query(reviewsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    } as Review;
  });
}

// Submit a new review
export async function submitReview(
  db: Firestore,
  productId: string,
  reviewData: NewReviewData
): Promise<void> {
  const productRef = doc(db, 'products', productId);
  const reviewsCollection = collection(productRef, 'reviews');

  const newReview = {
    ...reviewData,
    createdAt: serverTimestamp(),
  };

  try {
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }

      const productData = productDoc.data();
      const oldRatingTotal = (productData.rating || 0) * (productData.reviewCount || 0);
      const newReviewCount = (productData.reviewCount || 0) + 1;
      const newAverageRating = (oldRatingTotal + reviewData.rating) / newReviewCount;
      
      // Add the new review document
      const newReviewRef = doc(reviewsCollection);
      transaction.set(newReviewRef, newReview);

      // Update the product's average rating and review count
      transaction.update(productRef, {
        rating: newAverageRating,
        reviewCount: newReviewCount,
      });
    });
  } catch (serverError: any) {
    // If the error is a permission error, we want to emit it.
    if (serverError.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
            path: reviewsCollection.path,
            operation: 'create',
            requestResourceData: newReview,
        });
        errorEmitter.emit('permission-error', permissionError);
    }
    // Re-throw the original error to be handled by the calling component
    throw serverError;
  }
}
