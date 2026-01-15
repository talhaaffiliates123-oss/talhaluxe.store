
import { notFound } from 'next/navigation';
import { initializeFirebase } from '@/firebase/server-initialization';
import type { Product, Review } from '@/lib/types';
import ProductDetailClient from './product-detail-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getProductAndReviews(id: string): Promise<{ product: Product | null; reviews: Review[] }> {
  try {
    const { firestore } = initializeFirebase();
    const productRef = firestore.collection('products').doc(id);
    const reviewsRef = productRef.collection('reviews').orderBy('createdAt', 'desc');

    const productSnap = await productRef.get();
    
    if (!productSnap.exists) {
      return { product: null, reviews: [] };
    }

    const productData = productSnap.data();
    const product = { ...productData, id: productSnap.id } as Product;

    const reviewsSnap = await reviewsRef.get();
    const reviews = reviewsSnap.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Review
    });

    return { product, reviews };

  } catch (error) {
    console.error(`Failed to fetch product data for id "${id}":`, error);
    return { product: null, reviews: [] };
  }
}

export default async function ProductDetailServer({ id }: { id: string }) {
  if (!id) {
    notFound();
  }

  const { product, reviews } = await getProductAndReviews(id);

  if (!product) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
            <h1 className="mt-4 text-2xl font-bold">Product Not Found</h1>
            <p className="mt-2 text-muted-foreground">
                Sorry, we couldn't find the product you're looking for. It might have been removed or the link is incorrect.
            </p>
            <Button asChild className="mt-6">
                <Link href="/shop">Back to Shop</Link>
            </Button>
        </div>
    );
  }

  return <ProductDetailClient initialProduct={product} initialReviews={reviews} />;
}
