'use client';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span>{product.rating}</span>
            </div>
          </div>
          <h3 className="mt-1 font-semibold truncate">
            <Link href={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            {product.discountedPrice ? (
              <>
                <p className="text-lg font-bold">PKR {product.discountedPrice}</p>
                <p className="text-sm text-muted-foreground line-through">
                  PKR {product.price}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold">PKR {product.price}</p>
            )}
          </div>
          <Button
            className="w-full mt-4 bg-primary hover:bg-primary/90"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
      </CardContent>
    </Card>
  );
}
