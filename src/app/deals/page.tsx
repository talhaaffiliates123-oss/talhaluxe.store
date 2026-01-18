
'use client';
import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { getActiveDeals } from '@/lib/deals';
import type { Deal } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import DealCard from '@/components/deals/deal-card';
import { Tags } from 'lucide-react';
import Image from 'next/image';

export default function DealsPage() {
  const firestore = useFirestore();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firestore) {
      getActiveDeals(firestore)
        .then(setDeals)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [firestore]);

  const dealsBannerUrl = "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMGRlYWxzfGVufDB8fHx8fDE3Njc1NDQ0NTh8MA&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <div>
        <section className="relative h-[40vh] w-full bg-muted">
            <Image
                src={dealsBannerUrl}
                alt="Shopping bags with sale tags"
                fill
                className="object-cover"
                priority
                data-ai-hint="shopping deals"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
                    Special Deals & Bundles
                </h1>
                <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200">
                    Discover exclusive offers and curated product bundles at unbeatable prices.
                </p>
            </div>
        </section>

        <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-96 w-full" />
                    </div>
                ))
            ) : deals.length > 0 ? (
                deals.map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                ))
            ) : (
                <div className="md:col-span-3 text-center py-16">
                    <Tags className="mx-auto h-16 w-16 text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium">No active deals right now.</p>
                    <p className="text-muted-foreground">Check back soon for new offers!</p>
                </div>
            )}
            </div>
        </div>
    </div>
  );
}
