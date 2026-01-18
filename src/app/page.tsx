
'use client';

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import HomePageContent from '@/components/layout/home-page-content';
import { getProducts } from '@/lib/products';
import { getActiveDeals } from '@/lib/deals';
import type { Product, Deal } from '@/lib/types';

export default function HomePage() {
  const firestore = useFirestore();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);
  
  useEffect(() => {
    if (firestore) {
      getProducts(firestore).then(setProducts).catch(console.error);
      getActiveDeals(firestore).then(setDeals).catch(console.error);
    }
  }, [firestore]);

  return (
    <HomePageContent products={products || []} deals={deals || []} />
  );
}
