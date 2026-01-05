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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DocumentData, DocumentSnapshot, collection, getDocs, limit, orderBy, query, startAfter, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const PAGE_SIZE = 10;

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: Timestamp;
};


export default function OrdersTable() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<DocumentData, DocumentData> | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = useCallback(async (direction: 'next' | 'initial' = 'initial') => {
    if (!firestore) return;
    setLoading(true);

    try {
        const baseQuery = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
        let q;

        if (direction === 'next' && lastVisible) {
            q = query(baseQuery, startAfter(lastVisible), limit(PAGE_SIZE));
        } else {
            q = query(baseQuery, limit(PAGE_SIZE));
        }
        
        const documentSnapshots = await getDocs(q);
        const newOrders = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

        if (!documentSnapshots.empty) {
            if (direction === 'initial') {
                setOrders(newOrders);
            } else {
                setOrders(prev => [...prev, ...newOrders]);
            }
            setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
        } else if (direction === 'initial') {
            setOrders([]);
        }

        setIsLastPage(documentSnapshots.docs.length < PAGE_SIZE);

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
}, [firestore, lastVisible, toast]);

    const fetchTotalCount = useCallback(async () => {
         if(firestore) {
            const coll = collection(firestore, 'orders');
            const snap = await getDocs(coll);
            setTotalOrders(snap.size);
        }
    }, [firestore]);
  
  useEffect(() => {
    fetchTotalCount();
    fetchOrders('initial');
  }, [fetchOrders, fetchTotalCount]);


  const handleNextPage = () => {
    if (isLastPage) return;
    setPage(p => p + 1);
    fetchOrders('next');
  }

  const handlePrevPage = () => {
    setPage(1);
    setLastVisible(null);
    fetchOrders('initial');
  }

  return (
    <Card>
      <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>{!loading ? `Showing ${orders.length} of ${totalOrders} orders.` : 'Loading...'}</CardDescription>
      </CardHeader>
      <CardContent>
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer (User ID)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {loading && orders.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-6 w-16" /></TableCell>
                    </TableRow>
                  ))
              ) : orders.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                          <p>No orders found.</p>
                      </TableCell>
                  </TableRow>
              ) : orders.map((order) => {
                  return (
                      <TableRow key={order.id}>
                          <TableCell className="font-medium truncate max-w-[120px]">{order.id}</TableCell>
                          <TableCell className="truncate max-w-[120px]">{order.userId}</TableCell>
                          <TableCell>{order.createdAt ? format(order.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Shipped' ? 'secondary' : 'outline' }>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">PKR {order.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                  )
              })}
              </TableBody>
          </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Page <strong>{page}</strong>
        </div>
        <div className="ml-auto space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={isLastPage}>Next</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
