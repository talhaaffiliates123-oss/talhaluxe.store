
import { initializeFirebase } from "@/firebase/server-initialization";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default async function HomePage() {
  // Fetch from Firebase
  const { firestore } = initializeFirebase();
  const productsRef = firestore.collection("products");
  const querySnapshot = await productsRef.orderBy("createdAt", "desc").get();
  
  const products = querySnapshot.docs.map(doc => {
    const data = doc.data();
    // Convert Firestore Timestamp to a serializable format (ISO string)
    // to prevent errors when passing from a Server Component to a Client Component.
    const serializableData = {
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
    };
    return { id: doc.id, ...serializableData };
  });

  return (
    <main className="max-w-7xl mx-auto p-8 bg-background">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-foreground">Talha Luxe Inventory</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as Product} />
        ))}
      </div>
    </main>
  );
}
