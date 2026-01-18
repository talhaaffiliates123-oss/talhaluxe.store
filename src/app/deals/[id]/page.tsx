
import { Suspense } from 'react';
import DealDetailClient from './deal-detail-client';
import { Skeleton } from '@/components/ui/skeleton';

function DealPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-20 w-full mt-4" />
                    <Skeleton className="h-12 w-1/4 mt-6" />
                    <Skeleton className="h-12 w-48 mt-6" />
                </div>
                <div className='space-y-4'>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        </div>
    );
}

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <Suspense fallback={<DealPageSkeleton />}>
          <DealDetailClient id={id} />
        </Suspense>
    </div>
  );
}
