
'use client';

import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, shippingTotal, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Your Cart is Empty</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8 font-headline">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => {
            const imageUrl = product.imageUrls?.[0] || 'https://placehold.co/128x128/EEE/31343C?text=No+Image';
            const price = product.discountedPrice ?? product.price;
            return (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        width={128}
                        height={128}
                        className="h-full w-full object-cover"
                      />
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-2">
                    <div>
                      <h3 className="font-semibold leading-tight">
                        <Link href={`/product/${product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="text-sm text-muted-foreground hidden sm:block">{product.shortDescription}</p>
                      <p className="sm:hidden mt-1 font-bold">PKR {price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity - 1)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center text-sm">{quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity + 1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        </div>
                         <div className="sm:hidden">
                             <Button variant="ghost" size="icon" onClick={() => removeItem(product.id)}>
                                <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col justify-between items-end">
                    <p className="font-bold text-lg">PKR {(price * quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(product.id)}>
                        <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
           <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
        </div>

        <aside className="lg:col-span-1 space-y-6">
            <div className="bg-muted p-4 rounded-lg text-center hover:bg-muted/90 transition-colors">
                <a href="https://otieu.com/4/10452971" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground">
                    ✨ Unlock Exclusive Savings! Click here to discover special offers from our partner. ✨
                </a>
            </div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>PKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingTotal > 0 ? `PKR ${shippingTotal.toFixed(2)}` : 'Free'}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>PKR {totalPrice.toFixed(2)}</span>
              </div>
              <div className="space-y-2 pt-4">
                <Input placeholder="Discount code" />
                <Button variant="outline" className="w-full">Apply</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  );
}
