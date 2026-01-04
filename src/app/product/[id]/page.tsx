'use client';

import { notFound, useParams } from 'next/navigation';
import { products } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, Minus, Plus, Star, Truck } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();

  if (!product) {
    notFound();
  }

  const productImages = product.imageIds.map(id => PlaceHolderImages.find(img => img.id === id)).filter(Boolean);
  const [mainImage, setMainImage] = useState(productImages[0]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Product Image Gallery */}
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-lg border">
            {mainImage && (
                <Image
                src={mainImage.imageUrl}
                alt={product.name}
                width={800}
                height={800}
                className="h-full w-full object-cover"
                data-ai-hint={mainImage.imageHint}
                />
            )}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {productImages.map((img, index) => img && (
              <button
                key={index}
                onClick={() => setMainImage(img)}
                className={`aspect-square w-full overflow-hidden rounded-md border-2 ${mainImage?.id === img.id ? 'border-accent' : 'border-transparent'}`}
              >
                <Image
                  src={img.imageUrl}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                  data-ai-hint={img.imageHint}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight font-headline">{product.name}</h1>
            <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-accent fill-accent' : 'text-gray-300'}`} />
                    ))}
                </div>
                <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews.length} reviews)</span>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground">{product.shortDescription}</p>
          
          <div className="flex items-baseline gap-2">
            {product.discountedPrice ? (
              <>
                <span className="text-3xl font-bold">${product.discountedPrice}</span>
                <span className="text-xl text-muted-foreground line-through">${product.price}</span>
                <span className="ml-2 inline-block bg-destructive text-destructive-foreground text-sm font-medium px-2 py-1 rounded-md">SALE</span>
              </>
            ) : (
              <span className="text-3xl font-bold">${product.price}</span>
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
            <Button size="lg" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart} disabled={product.stock === 0}>
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              Buy Now
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
