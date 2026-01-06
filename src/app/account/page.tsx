
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
import { collection, query, where, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Order } from '@/lib/types';

type UserProfile = {
  name: string;
  email: string;
};

export default function AccountPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');

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
    // The composite query (where + orderBy different field) requires a manual index in Firestore.
    // To avoid this for the user, we query by userId and sort on the client.
    return query(
      collection(firestore, 'orders'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: rawOrders, loading: ordersLoading } = useCollection<Order>(ordersQuery);
  
  const orders = useMemo(() => {
    if (!rawOrders) return [];
    // Sort orders by creation date, descending.
    return [...rawOrders].sort((a, b) => {
        const dateA = a.createdAt?.toDate() ?? 0;
        const dateB = b.createdAt?.toDate() ?? 0;
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        return 0;
    });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">My Account</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your account details and view your order history.</p>
      </div>

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
                        <TableCell className="font-medium truncate max-w-[100px]">{order.id}</TableCell>
                        <TableCell>{order.createdAt ? format(order.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Shipped' ? 'secondary' : 'outline' }>{order.status}</Badge>
                        </TableCell>
                        <TableCell>PKR {order.totalPrice.toFixed(2)}</TableCell>
                        <TableCell><Button variant="outline" size="sm">View Details</Button></TableCell>
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
    </div>
  );
}
