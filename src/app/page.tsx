'use client';
import { getProducts } from '@/lib/products';
import { useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import HomePageContent from '@/components/layout/home-page-content';
import type { Product } from '@/lib/types';

export default function Home() {
  const firestore = useFirestore();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (firestore) {
      getProducts(firestore).then(setProducts);
    }
  }, [firestore]);

  return <HomePageContent products={products} />;
}
