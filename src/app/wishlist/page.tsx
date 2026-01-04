import ProductCard from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/data";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  // This should be fetched for the logged-in user
  const wishlistItems = [products[1], products[4], products[6]];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">My Wishlist</h1>
        <p className="mt-2 text-lg text-muted-foreground">Your collection of favorite items.</p>
      </div>

      {wishlistItems.length === 0 ? (
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
