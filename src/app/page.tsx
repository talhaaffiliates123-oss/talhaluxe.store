import { getProducts } from '@/lib/products';
import { initializeFirebase } from '@/firebase/server-initialization';
import HomePageContent from '@/components/layout/home-page-content';

export default async function Home() {
  const { firestore } = initializeFirebase();
  const products = await getProducts(firestore);

  return <HomePageContent products={products} />;
}
