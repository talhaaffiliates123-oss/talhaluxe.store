
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
import { StripeElementsOptions } from '@stripe/stripe-js';
import Link from 'next/link';

function CheckoutForm() {
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore ) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Services not ready. Please try again in a moment.',
      });
      return;
    }
    
    setIsProcessing(true);

    try {
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

        if (paymentMethod === 'card') {
            if (!stripe || !elements) {
                toast({ variant: 'destructive', title: 'Error', description: 'Stripe is not ready.' });
                setIsProcessing(false);
                return;
            }

            const { error: stripeError } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (stripeError) {
                toast({ variant: 'destructive', title: 'Payment Failed', description: stripeError.message });
                setIsProcessing(false);
                return;
            }
        }

        const docRef = collection(firestore, 'orders');
        await addDoc(docRef, orderData)
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'create',
                    requestResourceData: orderData,
                });
                errorEmitter.emit('permission-error', permissionError);
                throw serverError;
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
    } finally {
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
                <RadioGroup defaultValue="cod" className="space-y-2" onValueChange={setPaymentMethod}>
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
                      {stripe && elements ? <PaymentElement /> : <p>Loading payment form...</p>}
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
  const { items, totalPrice } = useCart();
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    // Only create a payment intent if there's something in the cart
    if (totalPrice > 0) {
        setLoadingSecret(true);
        fetch('/api/create-payment-intent', { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: totalPrice }) 
        })
        .then(res => res.json())
        .then(data => {
            if(data.clientSecret) {
                setClientSecret(data.clientSecret)
            } else {
                console.error("Failed to get client secret:", data.error);
            }
        })
        .catch(error => console.error("Error fetching client secret:", error))
        .finally(() => setLoadingSecret(false));
    } else {
        setLoadingSecret(false);
    }
  }, [totalPrice]);

  if (userLoading || !user || (loadingSecret && totalPrice > 0) || items.length === 0) {
    // Show loading skeleton if user is loading, secret is loading, or cart is empty
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <Skeleton className="h-10 w-64 mx-auto" />
            </div>
             {items.length === 0 && !userLoading ? (
                <div className="text-center py-10">
                    <p className="text-lg">Your cart is empty.</p>
                    <Button asChild className="mt-4">
                        <Link href="/shop">Go Shopping</Link>
                    </Button>
                </div>
             ) : (
                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            )}
        </div>
    )
  }
  
  const options: StripeElementsOptions | undefined = clientSecret ? { clientSecret, appearance: { theme: 'stripe' } } : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Checkout</h1>
      </div>
      {options ? (
         <Elements stripe={stripePromise} options={options}>
            <CheckoutForm />
         </Elements>
      ) : (
        // This fallback handles the case where total is 0, so no clientSecret is needed.
        // It allows COD "purchases" of free items, which is a valid edge case.
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}
