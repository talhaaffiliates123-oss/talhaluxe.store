
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCollection, useDoc, useFirestore, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc, addDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Order } from '@/lib/types';
import { updateOrderStatus } from '@/lib/orders';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

type UserProfile = {
  name: string;
  email: string;
};

const cancellationReasonsList = [
    { id: 'mistake', label: 'Ordered by mistake' },
    { id: 'better_price', label: 'Found a better price elsewhere' },
    { id: 'delivery_time', label: 'Estimated delivery time is too long' },
    { id: 'changed_mind', label: 'Changed my mind' },
    { id: 'other', label: 'Other (please specify below)' },
];

export default function AccountPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellationReasons, setCancellationReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);


  const userProfileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.name);
    }
  }, [userProfile]);

  const ordersQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: rawOrders } = useCollection<Order>(ordersQuery);
  
  const { orders, loading: ordersLoading } = useMemo(() => {
    if (!rawOrders) return { orders: [], loading: true };
    // Sort orders by creation date, descending.
    const sorted = [...rawOrders].sort((a, b) => {
        const dateA = a.createdAt?.toDate() ?? 0;
        const dateB = b.createdAt?.toDate() ?? 0;
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        return 0;
    });
    return { orders: sorted, loading: false };
  }, [rawOrders]);


  const handleProfileUpdate = async () => {
    if (!userProfileRef) return;
    const updatedData = { name: displayName };
    updateDoc(userProfileRef, updatedData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userProfileRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    toast({
      title: 'Profile Updated',
      description: 'Your name has been successfully updated.',
    });
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel || !firestore || !user) return;
    setIsCancelling(true);

    try {
        // 1. Submit cancellation reason
        const reasonsToSubmit = cancellationReasons.filter(r => r !== 'other');
        const showCustomReason = cancellationReasons.includes('other');

        const reasonData = {
            orderId: orderToCancel.id,
            userId: user.uid,
            reasons: reasonsToSubmit,
            customReason: showCustomReason ? customReason : '',
            createdAt: new Date(),
        };

        const reasonsCollection = collection(firestore, 'cancellationReasons');
        addDoc(reasonsCollection, reasonData).catch(err => {
            console.error("Could not submit cancellation reason:", err);
            // Non-critical, so we don't block the cancellation itself
        });

        // 2. Update order status
        await updateOrderStatus(firestore, orderToCancel.id, 'Cancelled', 'customer');

        toast({
            title: 'Order Cancelled',
            description: 'Your order has been successfully cancelled.',
        });
        
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Cancellation Failed',
            description: error.message || 'Could not cancel the order.',
        });
    } finally {
        // 3. Reset state
        setOrderToCancel(null);
        setCancellationReasons([]);
        setCustomReason('');
        setIsCancelling(false);
    }
  }

  const handleReasonChange = (reasonId: string, checked: boolean) => {
    setCancellationReasons(prev => 
        checked ? [...prev, reasonId] : prev.filter(r => r !== reasonId)
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">My Account</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your account details and view your order history.</p>
      </div>
      <AlertDialog open={!!orderToCancel} onOpenChange={(isOpen) => !isOpen && setOrderToCancel(null)}>
        <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="mt-6">
            <Card>
                <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View the status and details of your past orders.</CardDescription>
                </CardHeader>
                <CardContent>
                {ordersLoading ? (
                    <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    </div>
                ) : !orders || orders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">You haven't placed any orders yet.</p>
                ) : (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id.substring(0,8)}...</TableCell>
                            <TableCell>{order.createdAt ? format(order.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                            <TableCell>
                            <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Cancelled' ? 'destructive' : order.status === 'Shipped' ? 'secondary' : 'outline' }>{order.status}</Badge>
                            </TableCell>
                            <TableCell>PKR {order.totalPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Drawer>
                                    <DrawerTrigger asChild>
                                        <Button variant="outline" size="sm">View Details</Button>
                                    </DrawerTrigger>
                                    <DrawerContent>
                                        <div className="mx-auto w-full max-w-2xl p-4 select-text">
                                            <DrawerHeader>
                                                <DrawerTitle>Order Details</DrawerTitle>
                                                <DrawerDescription>Order ID: {order.id}</DrawerDescription>
                                            </DrawerHeader>
                                            <div className="p-4 grid gap-6">
                                                <div className="grid gap-2">
                                                    <h4 className="font-medium">Items</h4>
                                                    {order.items.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <div className="text-muted-foreground">{item.name} (x{item.quantity})</div>
                                                            <div>PKR {(item.price * item.quantity).toFixed(2)}</div>
                                                        </div>
                                                    ))}
                                                    <Separator className="my-2"/>
                                                    <div className="flex justify-between font-semibold">
                                                        <div>Total</div>
                                                        <div>PKR {order.totalPrice.toFixed(2)}</div>
                                                    </div>
                                                </div>
                                                <Separator />
                                                <div className="grid gap-2">
                                                    <h4 className="font-medium">Shipping Address</h4>
                                                    <div className="text-muted-foreground">
                                                        <div>{order.shippingInfo.name}</div>
                                                        <div>{order.shippingInfo.address}</div>
                                                        <div>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}</div>
                                                        <div>{order.shippingInfo.country}</div>
                                                    </div>
                                                </div>
                                                <Separator />
                                                <div className="grid gap-2">
                                                    <h4 className="font-medium">Payment & Status</h4>
                                                    <div className="text-muted-foreground">Paid via {order.paymentMethod}</div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">Status: <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Shipped' ? 'secondary' : 'outline' }>{order.status}</Badge></div>
                                                </div>
                                            </div>
                                            <DrawerFooter className="pt-4">
                                                <DrawerClose asChild>
                                                    <Button variant="outline">Close</Button>
                                                </DrawerClose>
                                            </DrawerFooter>
                                        </div>
                                    </DrawerContent>
                                </Drawer>
                                {order.status === 'Processing' && (
                                     <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setOrderToCancel(order)}
                                        >
                                            Cancel Order
                                        </Button>
                                     </AlertDialogTrigger>
                                )}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                )}
                </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
            <Card>
                <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                {profileLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input 
                                id="name" 
                                value={displayName} 
                                onChange={(e) => setDisplayName(e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={userProfile?.email ?? ''} disabled/>
                        </div>
                        <Button onClick={handleProfileUpdate}>Save Changes</Button>
                    </>
                )}
                </CardContent>
            </Card>
            </TabsContent>
            
            <TabsContent value="addresses" className="mt-6">
            <Card>
                <CardHeader>
                <CardTitle>Shipping Addresses</CardTitle>
                <CardDescription>Manage your saved addresses for faster checkout.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="border p-4 rounded-md">
                    <h4 className="font-semibold">Primary Address</h4>
                    <p className="text-muted-foreground text-sm mt-1">123 Luxury Lane, Fashion City, 12345, USA</p>
                    <div className="mt-2 space-x-2">
                        <Button variant="link" className="p-0 h-auto">Edit</Button>
                        <Button variant="link" className="p-0 h-auto text-destructive hover:text-destructive/80">Delete</Button>
                    </div>
                </div>
                <Button variant="outline">Add New Address</Button>
                </CardContent>
            </Card>
            </TabsContent>
        </Tabs>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Cancel Order #{orderToCancel?.id.substring(0,8)}</AlertDialogTitle>
                <AlertDialogDescription>
                    Please let us know why you are cancelling. This feedback helps us improve our service.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    {cancellationReasonsList.map(reason => (
                        <div key={reason.id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`reason-${reason.id}`} 
                                onCheckedChange={(checked) => handleReasonChange(reason.id, !!checked)}
                                checked={cancellationReasons.includes(reason.id)}
                            />
                            <Label htmlFor={`reason-${reason.id}`} className="font-normal">{reason.label}</Label>
                        </div>
                    ))}
                </div>
                {cancellationReasons.includes('other') && (
                    <div className="space-y-2">
                        <Label htmlFor="custom-reason">Please specify:</Label>
                        <Textarea 
                            id="custom-reason"
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            placeholder="Tell us more..."
                        />
                    </div>
                )}
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction
                    onClick={handleConfirmCancel}
                    disabled={isCancelling || cancellationReasons.length === 0}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                    {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
