'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Heart, Minus, Plus, Star, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useFirestore } from '@/firebase';
import { getProduct } from '@/lib/products';
import { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  useEffect(() => {
    if (firestore && id) {
        getProduct(firestore, id as string).then(p => {
            if (p) {
                setProduct(p);
            } else {
                notFound();
            }
            setLoading(false);
        });
    }
  }, [firestore, id]);

  const imageUrls = product?.imageUrls?.length > 0 ? product.imageUrls : ['https://placehold.co/600x600/EEE/31343C?text=No+Image'];

  useEffect(() => {
    if (imageUrls.length > 1) {
      const timer = setInterval(() => {
        setActiveImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
      }, 10000); // Change image every 10 seconds

      return () => clearInterval(timer);
    }
  }, [imageUrls.length]);


  if (loading || !product) {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                <div>
                    <Skeleton className="aspect-square w-full rounded-lg"/>
                     <div className="mt-4 grid grid-cols-5 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square w-full rounded-md" />
                        ))}
                    </div>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-8 w-1/4" />
                    <div className="flex gap-4">
                        <Skeleton className="h-12 w-32" />
                        <Skeleton className="h-12 flex-1" />
                    </div>
                </div>
            </div>
        </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
           <div className="aspect-square relative w-full overflow-hidden rounded-lg border">
              <Image 
                src={imageUrls[activeImageIndex]} 
                alt={`${product.name} image ${activeImageIndex + 1}`} 
                fill 
                className="object-cover transition-opacity duration-500"
                key={activeImageIndex}
              />
            </div>
            {imageUrls.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-4">
                    {imageUrls.map((url, index) => (
                        <button 
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={cn(
                                "aspect-square relative w-full overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                activeImageIndex === index ? "ring-2 ring-primary ring-offset-2" : "opacity-75 hover:opacity-100"
                            )}
                        >
                            <Image src={url} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight font-headline">{product.name}</h1>
            <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                </div>
                <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews?.length ?? 0} reviews)</span>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground">{product.shortDescription}</p>
          
          <div className="flex items-baseline gap-2">
            {product.discountedPrice ? (
              <>
                <span className="text-3xl font-bold">PKR {product.discountedPrice}</span>
                <span className="text-xl text-muted-foreground line-through">PKR {product.price}</span>
                <span className="ml-2 inline-block bg-destructive text-destructive-foreground text-sm font-medium px-2 py-1 rounded-md">SALE</span>
              </>
            ) : (
              <span className="text-3xl font-bold">PKR {product.price}</span>
            )}
          </div>

          <Separator />
          
          <div className="space-y-4">
            <p className="text-muted-foreground">{product.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-5 w-5 text-accent"/>
                <span>Free shipping on orders over $50</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={product.stock === 0}>
              Buy Now
            </Button>
            <Button size="lg" variant="secondary" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
              Add to Cart
            </Button>
             <Button size="lg" variant="outline" className="px-4">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
