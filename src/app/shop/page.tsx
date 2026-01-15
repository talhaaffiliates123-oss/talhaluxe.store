
import { Suspense } from 'react';
import ShopContent from './shop-content';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Filter } from 'lucide-react';

function ShopPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8 text-center">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold flex items-center mb-4">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
              </h2>
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-4 pt-6 mt-6 border-t">
                 <Skeleton className="h-6 w-1/2" />
                 <Skeleton className="h-5 w-full" />
                 <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                 </div>
              </div>
            </CardContent>
          </Card>
        </aside>
        <main className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}


export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}
