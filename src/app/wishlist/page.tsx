'use client';
import ProductCard from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/products";
import { Product } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const firestore = useFirestore();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // This is a mock wishlist. In a real app, you'd fetch this from user data.
  const wishlistedIds = ['prod_002', 'prod_005', 'prod_007'];

  useEffect(() => {
    if (firestore) {
      getProducts(firestore).then(allProducts => {
        // This should be replaced with actual user wishlist data
        const items = allProducts.filter(p => wishlistedIds.includes(p.id));
        setWishlistItems(items);
        setLoading(false);
      });
    }
  }, [firestore]);


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">My Wishlist</h1>
        <p className="mt-2 text-lg text-muted-foreground">Your collection of favorite items.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({length: 4}).map((_, i) => <div key={i} className="space-y-2"><div className="h-64 w-full bg-muted animate-pulse rounded-md"/></div>)}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Your wishlist is empty.</h2>
          <p className="mt-2 text-muted-foreground">
            Add items you love to your wishlist to keep track of them.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Explore Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
