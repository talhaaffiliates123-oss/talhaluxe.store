
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductForm from '@/components/admin/product-form';
import { useFirestore } from '@/firebase';
import { getProduct } from '@/lib/products';
import { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// NOTE: This page still uses client-side fetching because it's in the admin area
// and benefits from the immediate user-based auth checks and real-time updates.
// Converting it to a full server component would require passing the firestore instance
// differently and handling auth at the layout level.

export default function EditProductPage() {
  const { id } = useParams();
  const firestore = useFirestore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firestore && id) {
      getProduct(firestore, id as string).then((productData) => {
        setProduct(productData);
        setLoading(false);
      });
    }
  }, [firestore, id]);

  if (loading) {
    return (
        <div>
            <div className="mb-6 space-y-2">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-96 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div>
       <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update the details for &quot;{product.name}&quot;.</p>
        </div>
      <ProductForm initialData={product} />
    </div>
  );
}
