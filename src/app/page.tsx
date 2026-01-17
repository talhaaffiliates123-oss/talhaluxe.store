
'use client';

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function HomePage() {
  const firestore = useFirestore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firestore) {
      setLoading(true);
      const productsRef = collection(firestore, "products");
      const q = query(productsRef, orderBy("createdAt", "desc"));
      
      getDocs(q)
        .then((querySnapshot) => {
          const prods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setProducts(prods);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
        setLoading(false); // If firestore is not available, stop loading
    }
  }, [firestore]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border rounded-xl p-4 shadow-sm bg-white space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="w-12 h-12 rounded" />
            <Skeleton className="w-12 h-12 rounded" />
            <Skeleton className="w-12 h-12 rounded" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      ))}
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto p-8 bg-background">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-foreground">Talha Luxe Inventory</h1>
      
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
