'use client';
import { useCart } from '@/hooks/use-cart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Truck } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from '@/components/ui/skeleton';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';

function CheckoutForm() {
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !stripe || !elements) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Services not ready. Please try again in a moment.',
      });
      return;
    }
    
    setIsProcessing(true);

    if (paymentMethod === 'cod') {
        // Handle Cash on Delivery
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
          await addDoc(docRef, orderData)
          .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: docRef.path,
              operation: 'create',
              requestResourceData: orderData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError; // re-throw to be caught by outer try-catch
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
            setIsProcessing(false);
        }
    } else {
        // Handle Card payment
        // We will add the logic to create a payment intent and confirm the payment here in a future step.
        toast({
            title: "Card payment coming soon!",
            description: "Card payments are not fully integrated yet. Please select Cash on Delivery.",
        });
        setIsProcessing(false);
    }
  };

  return (
      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-2 gap-12">
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
                    <Input id="email" type="email" placeholder="you@example.com" defaultValue={user?.email ?? ''} disabled/>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Shipping Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" required/>
                  </div>
                  <div>
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" required/>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" required/>
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" required/>
                  </div>
                  <div>
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" required/>
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP / Postal Code</Label>
                    <Input id="zip" required/>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" required/>
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
                   <div className="space-y-4 pt-4 border-t mt-4">
                      <PaymentElement />
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
                  const imageUrl = product.imageUrls?.[0] || 'https://placehold.co/64x64/EEE/31343C?text=No+Image';
                  return (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                         <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm">{quantity}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                      </div>
                      <p className="font-medium">
                        PKR {((product.discountedPrice ?? product.price) * quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-6" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>PKR {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>PKR {totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                size="lg" 
                className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
                type="submit"
                disabled={items.length === 0 || !user || isProcessing || (paymentMethod === 'card' && (!stripe || !elements))}
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
  );
}


export default function CheckoutPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/login');
    }
  }, [user, userLoading, router]);

  // We need a client secret to use the Stripe Elements.
  // This will be created on the server in a future step.
  // For now, we'll just use a placeholder.
  const [clientSecret, setClientSecret] = useState('');

  if (userLoading || !user) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <Skeleton className="h-10 w-64 mx-auto" />
            </div>
            <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Checkout</h1>
      </div>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <CheckoutForm />
      </Elements>
    </div>
  );
}
