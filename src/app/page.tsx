import { getProducts } from '@/lib/products';
import { getFirebaseAdmin } from '@/firebase/server-initialization';
import HomePageContent from '@/components/layout/home-page-content';

export default async function Home() {
  const { firestore } = getFirebaseAdmin();
  const products = await getProducts(firestore);

  return <HomePageContent products={products} />;
}
