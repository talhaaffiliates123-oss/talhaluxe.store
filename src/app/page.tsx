import { getProductsForServer } from '@/lib/products.server';
import { getFirebaseAdmin } from '@/firebase/server-initialization';
import HomePageContent from '@/components/layout/home-page-content';

export default async function Home() {
  const { firestore } = getFirebaseAdmin();
  const products = await getProductsForServer(firestore);

  return <HomePageContent products={products} />;
}
