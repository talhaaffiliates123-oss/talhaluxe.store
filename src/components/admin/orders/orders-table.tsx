
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
} from '@/components/ui/card';
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
} from "@/components/ui/alert-dialog"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import type { Order } from '@/lib/types';
import { updateOrderStatus } from '@/lib/orders';
import { MoreHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';


interface OrdersTableProps {
    searchTerm: string;
}

// A simple component to highlight text matches
const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <span>
            {parts.filter(String).map((part, i) => {
                return regex.test(part) ? (
                    <mark key={i} className="bg-accent/50 text-accent-foreground p-0 rounded">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                );
            })}
        </span>
    );
};


export default function OrdersTable({ searchTerm }: OrdersTableProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

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

    const handleStatusChange = async (orderId: string, status: Order['status']) => {
        if (!firestore) return;

        try {
            await updateOrderStatus(firestore, orderId, status);
            toast({
                title: "Order Updated",
                description: `Order status changed to ${status}.`
            });
            // Refresh the list locally for immediate feedback
            setAllOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status } : o));
        } catch (error) {
            console.error("Error updating order status:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not update order status.",
            });
        }
    }

    const handleConfirmCancel = () => {
        if (orderToCancel) {
            handleStatusChange(orderToCancel.id, 'Cancelled');
            setOrderToCancel(null);
        }
    }

    const cancellationEmailBody = orderToCancel ? `
Subject: Regarding your Talha Luxe Order #${orderToCancel.id}

Dear ${orderToCancel.shippingInfo.name},

We are writing to inform you that your recent order #${orderToCancel.id} has been cancelled by an admin.

If you have any questions or concerns, please do not hesitate to contact us by replying to this email or reaching out to Talhaluxe999@gmail.com.

We apologize for any inconvenience this may cause.

Sincerely,
The Talha Luxe Team
` : '';


    const OrderDetailsDrawer = ({ order }: { order: Order }) => (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline" size="sm">View Details</Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-2xl p-4 select-text">
                    <DrawerHeader>
                        <DrawerTitle>Order Details</DrawerTitle>
                        <DrawerDescription>Order ID: <Highlight text={order.id} highlight={searchTerm} /></DrawerDescription>
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
                    <DrawerFooter className="pt-4">
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );

    const renderDesktopTable = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell>
                            <div className="font-medium">
                                <Highlight text={order.shippingInfo?.name ?? 'N/A'} highlight={searchTerm} />
                            </div>
                            <div className="text-sm text-muted-foreground">{order.shippingInfo?.email ?? order.userId}</div>
                        </TableCell>
                        <TableCell>{order.createdAt ? format(order.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Cancelled' ? 'destructive' : order.status === 'Shipped' ? 'secondary' : 'outline'}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">PKR {order.totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <OrderDetailsDrawer order={order} />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={!firestore}>
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)}>Copy order ID</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Processing')}>Mark as Processing</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Shipped')}>Mark as Shipped</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Delivered')}>Mark as Delivered</DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onSelect={(e) => { e.preventDefault(); setOrderToCancel(order); }}
                                            >
                                                Cancel Order
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderMobileCards = () => (
        <div className="space-y-4">
            {filteredOrders.map(order => (
                <Card key={order.id}>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold"><Highlight text={order.shippingInfo?.name ?? 'N/A'} highlight={searchTerm} /></p>
                                <p className="text-sm text-muted-foreground">{order.createdAt ? format(order.createdAt.toDate(), 'PPP') : 'N/A'}</p>
                            </div>
                            <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Cancelled' ? 'destructive' : order.status === 'Shipped' ? 'secondary' : 'outline'}>{order.status}</Badge>
                        </div>
                        <div className="flex justify-between items-center font-semibold">
                            <span>Total</span>
                            <span>PKR {order.totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <OrderDetailsDrawer order={order} />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={!firestore}>
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Processing')}>Mark as Processing</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Shipped')}>Mark as Shipped</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Delivered')}>Mark as Delivered</DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onSelect={(e) => { e.preventDefault(); setOrderToCancel(order); }}
                                        >
                                            Cancel Order
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );


    return (
        <Card>
            <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>{!loading ? `Showing ${filteredOrders.length} of ${allOrders.length} total orders.` : 'Loading...'}</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    {loading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-10">
                            <p>{searchTerm ? 'No orders match your search.' : 'No orders found.'}</p>
                        </div>
                    ) : (
                        isMobile ? renderMobileCards() : renderDesktopTable()
                    )}

                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Notify Customer of Cancellation</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will mark the order as 'Cancelled'. You should notify the customer. Copy the message below and send it to <span className='font-bold'>{orderToCancel?.shippingInfo.email}</span>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="mt-4 p-4 bg-muted rounded-md text-sm whitespace-pre-wrap select-all">
                            {cancellationEmailBody}
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setOrderToCancel(null)}>Go Back</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmCancel}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                                Confirm Cancellation
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
