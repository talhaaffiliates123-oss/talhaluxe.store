'use client';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { getProductRecommendations } from '@/ai/flows/product-recommendations';
import { products } from '@/lib/data';
import ProductCard from './products/product-card';
import { Skeleton } from './ui/skeleton';

const BROWSING_HISTORY_KEY = 'browsingHistory';
const MAX_HISTORY_LENGTH = 10;

interface ProductRecommendationsProps {
  currentProductId: string;
}

export default function ProductRecommendations({ currentProductId }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // 1. Get browsing history from local storage
        let history = JSON.parse(localStorage.getItem(BROWSING_HISTORY_KEY) || '[]');
        
        // 2. Add current product to history if it's not already the last one
        if (history[history.length - 1] !== currentProductId) {
            history.push(currentProductId);
        }
        
        // 3. Trim history to max length
        if (history.length > MAX_HISTORY_LENGTH) {
          history = history.slice(history.length - MAX_HISTORY_LENGTH);
        }
        
        // 4. Save updated history
        localStorage.setItem(BROWSING_HISTORY_KEY, JSON.stringify(history));

        // 5. Get best selling products
        const bestSellers = products.filter(p => p.isBestSeller).map(p => p.id);

        // 6. Call the AI flow
        const result = await getProductRecommendations({
          browsingHistory: history,
          bestSellingProducts: bestSellers,
          numberOfRecommendations: 4,
        });

        // 7. Filter out the current product from recommendations and map IDs to products
        const recommendedProducts = result.productIds
          .filter(id => id !== currentProductId)
          .map(id => products.find(p => p.id === id))
          .filter((p): p is Product => p !== undefined);

        setRecommendations(recommendedProducts);
      } catch (error) {
        console.error("Failed to get product recommendations:", error);
        // Fallback to showing some new arrivals
        setRecommendations(products.filter(p => p.isNewArrival && p.id !== currentProductId).slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if(recommendations.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {recommendations.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
