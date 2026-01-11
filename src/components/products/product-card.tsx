'use client';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const hasVariants = product.variants && product.variants.length > 0;
  
  const imageUrls = useMemo(() => {
    if (product.imageUrls?.length > 0) {
      return product.imageUrls;
    }
    if (hasVariants && product.variants) {
      const variantImages = product.variants.map(v => v.imageUrl).filter(Boolean);
      if (variantImages.length > 0) {
        return variantImages;
      }
    }
    return ['https://placehold.co/600x600/EEE/31343C?text=No+Image'];
  }, [product, hasVariants]);


  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    if (hasVariants) {
        router.push(`/product/${product.id}`);
    } else {
        addItem(product);
        toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
        });
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
  };
  
  const totalStock = hasVariants
    ? product.variants!.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-0">
        <Link href={`/product/${product.id}`} className="block">
            <div className="aspect-square w-full overflow-hidden relative">
                <Image
                  src={imageUrls[currentImageIndex]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  key={currentImageIndex} // Force re-render for transition
                />

                {imageUrls.length > 1 && (
                  <>
                    <Button 
                        onClick={prevImage}
                        variant="ghost" 
                        size="icon" 
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                     <Button 
                        onClick={nextImage}
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
                 {totalStock === 0 && (
                    <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
                        SOLD OUT
                    </div>
                 )}
            </div>
        </Link>
        <div className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{product.rating.toFixed(1)}</span>
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
            className="w-full mt-4"
            variant="secondary"
            onClick={handleAddToCart}
            disabled={totalStock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> 
            {hasVariants ? 'Select Options' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
