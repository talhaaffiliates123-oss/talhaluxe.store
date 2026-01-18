
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DealForm from '@/components/admin/deals/deal-form';
import { useFirestore } from '@/firebase';
import { getDeal } from '@/lib/deals';
import { Deal } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditDealPage() {
  const { id } = useParams();
  const firestore = useFirestore();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firestore && id) {
      getDeal(firestore, id as string).then((dealData) => {
        setDeal(dealData);
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
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
  }

  if (!deal) {
    return <div>Deal not found.</div>;
  }

  return (
    <div>
       <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Deal</h1>
          <p className="text-muted-foreground">Update the details for &quot;{deal.name}&quot;.</p>
        </div>
      <DealForm initialData={deal} />
    </div>
  );
}
