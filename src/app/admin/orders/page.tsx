'use client';
import { useState } from 'react';
import OrdersTable from '@/components/admin/orders/orders-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Trash } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { clearCompletedOrders } from '@/lib/orders';
import { useToast } from '@/hooks/use-toast';

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleClearOrders = async () => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
        return;
    }
    setIsClearing(true);
    try {
        await clearCompletedOrders(firestore);
        toast({ title: 'Success', description: 'Completed and cancelled orders have been cleared.' });
        setRefreshKey(prev => prev + 1); // Trigger a re-render of the table
    } catch(error: any) {
        console.error("Error clearing orders:", error);
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not clear orders.' });
    } finally {
        setIsClearing(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage all orders in your store.</p>
        </div>
        <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                    <Trash className="mr-2 h-4 w-4" />
                    Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all orders with the status of "Shipped", "Delivered", or "Cancelled". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearOrders} disabled={isClearing} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    {isClearing ? 'Clearing...' : 'Yes, clear history'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="w-full max-w-sm">
            <Input 
                placeholder="Search by name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
        </div>
      </div>
      <OrdersTable searchTerm={searchTerm} key={refreshKey} />
    </div>
  );
}
