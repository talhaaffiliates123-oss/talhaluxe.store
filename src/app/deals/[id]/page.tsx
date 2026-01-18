
import { notFound } from 'next/navigation';
import { getDeal } from '@/lib/deals';
import DealDetailClient from './deal-detail-client';
import { initializeFirebase } from '@/firebase/server-initialization';
import type { Deal } from '@/lib/types';


async function getDealOnServer(id: string): Promise<Deal | null> {
    try {
      const { firestore } = initializeFirebase();
      const dealDoc = await firestore.collection('deals').doc(id).get();
  
      if (!dealDoc.exists) {
        return null;
      }
      const data = dealDoc.data();
      
      const serializedProducts = data?.products.map((product: any) => {
        return {
            ...product,
            createdAt: product.createdAt?.toDate ? product.createdAt.toDate().toISOString() : null,
        }
      });
      
      const serializableData = {
          ...data,
          products: serializedProducts,
          createdAt: data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      }
      
      return { id: dealDoc.id, ...serializableData } as Deal;
    } catch (error) {
      console.error(`Failed to fetch deal with id "${id}":`, error);
      // In a real app, you might want to log this error to a service
      return null;
    }
}


export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    notFound();
  }

  const deal = await getDealOnServer(id);
  
  if (!deal || !deal.isActive) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <DealDetailClient deal={deal} />
    </div>
  );
}
