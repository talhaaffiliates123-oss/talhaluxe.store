
import { notFound } from 'next/navigation';
import { initializeFirebase } from '@/firebase/server-initialization';
import { Product, Review } from '@/lib/types';
import ProductDetailClient from './product-detail-client';

async function getProductAndReviews(productId: string): Promise<{ product: Product | null; reviews: Review[] }> {
  try {
    const { firestore } = initializeFirebase();

    const productRef = firestore.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return { product: null, reviews: [] };
    }

    const productData = { id: productDoc.id, ...productDoc.data() } as Product;

    const reviewsRef = productRef.collection('reviews').orderBy('createdAt', 'desc');
    const reviewsSnapshot = await reviewsRef.get();
    const reviewsData = reviewsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate().toISOString(), // Convert Timestamp
        } as Review;
    });

    return { product: productData, reviews: reviewsData };
  } catch (error) {
    console.error(`Error fetching product and reviews for ID "${productId}":`, error);
    // If fetching fails, return nulls to trigger a notFound or error boundary
    return { product: null, reviews: [] };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const { product, reviews } = await getProductAndReviews(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient initialProduct={product} initialReviews={reviews} />;
}
