
'use client';
import type { Deal, Product } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

interface DealDetailClientProps {
  deal: Deal;
}

export default function DealDetailClient({ deal }: DealDetailClientProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    // Create a "dummy" product representing the deal bundle
    const dealAsProduct: Product = {
      id: `deal_${deal.id}`, // Unique ID for cart
      name: deal.name,
      shortDescription: `Bundle of ${deal.products.length} products.`,
      description: deal.description,
      price: deal.dealPrice,
      category: 'deals', // Use a special category
      imageUrls: deal.products.flatMap(p => p.imageUrls),
      stock: 1, // Deals are generally "in stock" if active, let's just say 1
      rating: 0,
      isNewArrival: false,
      isBestSeller: false,
    };
    
    addItem(dealAsProduct, 1);
    toast({
      title: "Deal Added to Cart",
      description: `The "${deal.name}" bundle has been added to your cart.`,
    });
  };

  return (
    <div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">{deal.name}</h1>
                <p className="mt-4 text-lg text-muted-foreground">{deal.description}</p>
                <div className="mt-6">
                    <p className="text-sm text-muted-foreground">Total Deal Price</p>
                    <p className="text-4xl font-bold">PKR {deal.dealPrice.toFixed(2)}</p>
                </div>
                <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add Deal to Cart
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Products in this Deal ({deal.products.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {deal.products.map((product, index) => (
                        <div key={product.id || index}>
                            <div className="flex items-start gap-4">
                                <Link href={`/product/${product.id}`} className="block flex-shrink-0">
                                    <Image 
                                        src={product.imageUrls[0] || 'https://placehold.co/100x100'} 
                                        alt={product.name} 
                                        width={80} 
                                        height={80} 
                                        className="rounded-md border object-cover"
                                    />
                                </Link>
                                <div className="flex-1">
                                    <Link href={`/product/${product.id}`} className="block">
                                        <p className="font-semibold hover:underline">{product.name}</p>
                                    </Link>
                                    <p className="text-sm text-muted-foreground line-through">PKR {product.price.toFixed(2)}</p>
                                </div>
                            </div>
                            {index < deal.products.length - 1 && <Separator className="my-4" />}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
