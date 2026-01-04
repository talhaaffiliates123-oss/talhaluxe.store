'use client';
import { useCart } from '@/hooks/use-cart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Truck } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handlePlaceOrder = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to place an order.',
      });
      return;
    }

    const orderData = {
      userId: user.uid,
      items: items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.discountedPrice ?? item.product.price,
      })),
      totalPrice,
      paymentMethod,
      status: 'Processing',
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = collection(firestore, 'orders');
      addDoc(docRef, orderData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: orderData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      
      toast({
        title: 'Order Placed!',
        description: 'Thank you for your purchase. Your order is being processed.',
      });

      clearCart();
      router.push('/account');

    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: e.message || "Could not place order.",
        });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Checkout</h1>
      </div>
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Shipping & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" defaultValue={user?.email ?? ''}/>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Shipping Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" />
                  </div>
                  <div>
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP / Postal Code</Label>
                    <Input id="zip" />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Method</h3>
                <RadioGroup defaultValue="card" className="space-y-2" onValueChange={setPaymentMethod}>
                    <Label htmlFor="card" className="flex items-center gap-4 border rounded-md p-4 has-[:checked]:bg-muted has-[:checked]:border-accent cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <CreditCard className="w-5 h-5"/>
                        <span className="font-medium">Credit/Debit Card</span>
                    </Label>
                     <Label htmlFor="cod" className="flex items-center gap-4 border rounded-md p-4 has-[:checked]:bg-muted has-[:checked]:border-accent cursor-pointer">
                        <RadioGroupItem value="cod" id="cod" />
                        <Truck className="w-5 h-5"/>
                        <span className="font-medium">Cash on Delivery</span>
                    </Label>
                </RadioGroup>
                {paymentMethod === 'card' && (
                  <div className="grid grid-cols-1 gap-4 pt-4 border-t mt-4">
                    <div>
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input id="card-number" placeholder="•••• •••• •••• ••••" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry-date">Expiry Date</Label>
                        <Input id="expiry-date" placeholder="MM / YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="•••" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map(({ product, quantity }) => {
                  const image = PlaceHolderImages.find((img) => img.id === product.imageIds[0]);
                  return (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        {image && (
                          <Image
                            src={image.imageUrl}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                            data-ai-hint={image.imageHint}
                          />
                        )}
                         <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm">{quantity}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                      </div>
                      <p className="font-medium">
                        ${((product.discountedPrice ?? product.price) * quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-6" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                size="lg" 
                className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handlePlaceOrder}
                disabled={items.length === 0 || !user}
              >
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
