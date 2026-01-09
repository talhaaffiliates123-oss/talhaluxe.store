
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
import { addDoc, collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

function CheckoutPageSkeleton() {
    return (
        <div className="grid lg:grid-cols-2 gap-12">
            <div className="order-2 lg:order-1 space-y-4">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="order-1 lg:order-2">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    const { user, loading: userLoading } = useUser();
    const { items, totalPrice, clearCart } = useCart();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isProcessing, setIsProcessing] = useState(false);

    // State for shipping form
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('Pakistan');
    
    useEffect(() => {
        if (!userLoading && !user) {
            router.replace('/login?redirect=/checkout');
        }
    }, [user, userLoading, router]);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Services not ready. Please try again.' });
            return;
        }

        if (paymentMethod !== 'cod') {
            toast({ variant: 'destructive', title: 'Payment Method Unavailable', description: 'Please select Cash on Delivery.' });
            return;
        }

        setIsProcessing(true);

        try {
            const ordersCollection = collection(firestore, 'orders');
            const newOrderRef = doc(ordersCollection);

            const orderData = {
                userId: user.uid,
                shippingInfo: { name: fullName, email: user.email!, address, city, state, zip, country },
                items: items.map(item => ({
                    productId: item.product.id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.discountedPrice ?? item.product.price,
                })),
                totalPrice,
                paymentMethod,
                status: 'Processing' as const,
                createdAt: serverTimestamp(),
            };

            await setDoc(newOrderRef, orderData);

            toast({ title: 'Order Placed!', description: 'Thank you for your purchase!' });
            clearCart();
            router.push('/account');

        } catch (e: any) {
            if (!(e instanceof FirestorePermissionError)) {
                toast({ variant: "destructive", title: "Uh oh! Something went wrong.", description: e.message || "Could not place order." });
            }
        } finally {
            setIsProcessing(false);
        }
    };


    if (userLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-headline">Checkout</h1>
                </div>
                <CheckoutPageSkeleton />
            </div>
        );
    }
    
    if (items.length === 0 && !userLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Your Cart is Empty</h1>
                <p className="mt-2 text-lg text-muted-foreground">You can't checkout without any items.</p>
                <Button asChild className="mt-6"><Link href="/shop">Go Shopping</Link></Button>
            </div>
        );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-headline">Checkout</h1>
        </div>
        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-2 gap-12">
            <div className="order-2 lg:order-1">
                <Card>
                <CardHeader>
                    <CardTitle>Shipping & Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <Input id="email" type="email" defaultValue={user?.email ?? ''} disabled/>
                    </div>
    
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Shipping Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input id="full-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                        <div className="sm:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
                        </div>
                        <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" required value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>
                        <div>
                        <Label htmlFor="state">State / Province</Label>
                        <Input id="state" required value={state} onChange={(e) => setState(e.target.value)} />
                        </div>
                        <div>
                        <Label htmlFor="zip">ZIP / Postal Code</Label>
                        <Input id="zip" required value={zip} onChange={(e) => setZip(e.target.value)} />
                        </div>
                        <div>
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={country} disabled />
                        </div>
                    </div>
                    </div>
    
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Payment Method</h3>
                        <RadioGroup defaultValue="cod" value={paymentMethod} onValueChange={setPaymentMethod}>
                            <Label htmlFor="card" className="flex items-center gap-4 border rounded-md p-4 has-[:checked]:bg-muted has-[:checked]:border-accent cursor-not-allowed opacity-50">
                                <RadioGroupItem value="card" id="card" disabled />
                                <CreditCard className="w-5 h-5"/>
                                <span className="font-medium">Credit/Debit Card</span>
                                <span className="ml-auto text-xs text-muted-foreground">(Coming Soon)</span>
                            </Label>
                            <Label htmlFor="cod" className="flex items-center gap-4 border rounded-md p-4 has-[:checked]:bg-muted has-[:checked]:border-accent cursor-pointer">
                                <RadioGroupItem value="cod" id="cod" />
                                <Truck className="w-5 h-5"/>
                                <span className="font-medium">Cash on Delivery</span>
                            </Label>
                        </RadioGroup>
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
                    {items.map(({ product, quantity }) => (
                        <div key={product.id} className="flex items-center gap-4">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                <Image src={product.imageUrls?.[0] || 'https://placehold.co/64x64'} alt={product.name} width={64} height={64} className="h-full w-full object-cover"/>
                                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm">{quantity}</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium truncate">{product.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                            </div>
                            <p className="font-medium">PKR {((product.discountedPrice ?? product.price) * quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    </div>
                    <Separator className="my-6" />
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>Subtotal</span><span>PKR {totalPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>PKR {totalPrice.toFixed(2)}</span></div>
                    </div>
                    <Button 
                        size="lg" 
                        className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
                        type="submit"
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Place Order'}
                    </Button>
                </CardContent>
                </Card>
            </div>
        </form>
      </div>
    );
}
