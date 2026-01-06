'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
  } from '@/components/ui/card';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import type { Order } from '@/lib/types';


interface OrdersTableProps {
    searchTerm: string;
}

export default function OrdersTable({ searchTerm }: OrdersTableProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!firestore) return;
    setLoading(true);

    try {
        const q = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
        const documentSnapshots = await getDocs(q);
        const fetchedOrders = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setAllOrders(fetchedOrders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
            variant: "destructive",
            title: "Error fetching orders",
            description: "Could not retrieve order data.",
        });
    } finally {
        setLoading(false);
    }
}, [firestore, toast]);
  
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) {
        return allOrders;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return allOrders.filter(order => {
        const customerName = order.shippingInfo?.name?.toLowerCase() ?? '';
        const orderId = order.id.toLowerCase();
        return customerName.includes(lowercasedFilter) || orderId.includes(lowercasedFilter);
    });
  }, [searchTerm, allOrders]);


  return (
    <Card>
      <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>{!loading ? `Showing ${filteredOrders.length} of ${allOrders.length} total orders.` : 'Loading...'}</CardDescription>
      </CardHeader>
      <CardContent>
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Actions</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                  ))
              ) : filteredOrders.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                          <p>{searchTerm ? 'No orders match your search.' : 'No orders found.'}</p>
                      </TableCell>
                  </TableRow>
              ) : filteredOrders.map((order) => {
                  return (
                      <TableRow key={order.id}>
                          <TableCell>
                            <div className="font-medium">{order.shippingInfo?.name ?? 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{order.shippingInfo?.email ?? order.userId}</div>
                          </TableCell>
                          <TableCell>{order.createdAt ? format(order.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Shipped' ? 'secondary' : 'outline' }>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">PKR {order.totalPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <Drawer>
                                <DrawerTrigger asChild>
                                    <Button variant="outline" size="sm">View Details</Button>
                                </DrawerTrigger>
                                <DrawerContent>
                                    <div className="mx-auto w-full max-w-sm">
                                    <DrawerHeader>
                                        <DrawerTitle>Order Details</DrawerTitle>
                                        <DrawerDescription>Order ID: {order.id}</DrawerDescription>
                                    </DrawerHeader>
                                    <div className="p-4 space-y-4">
                                        <div className="space-y-1">
                                            <h4 className="font-medium">Shipping Address</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {order.shippingInfo.name}<br />
                                                {order.shippingInfo.address}<br />
                                                {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}<br />
                                                {order.shippingInfo.country}
                                            </p>
                                        </div>
                                         <div className="space-y-1">
                                            <h4 className="font-medium">Items</h4>
                                            <ul className="text-sm text-muted-foreground list-disc pl-5">
                                                {order.items.map(item => (
                                                    <li key={item.productId}>{item.name} (x{item.quantity})</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    </div>
                                </DrawerContent>
                            </Drawer>
                          </TableCell>
                      </TableRow>
                  )
              })}
              </TableBody>
          </Table>
      </CardContent>
    </Card>
  );
}
