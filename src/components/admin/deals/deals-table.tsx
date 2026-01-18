
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
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useEffect, useState, useCallback } from 'react';
import { Deal } from '@/lib/types';
import { deleteDeal, getDeals } from '@/lib/deals';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function DealsTable() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    if (!firestore) return;
    setLoading(true);

    try {
        const fetchedDeals = await getDeals(firestore);
        setDeals(fetchedDeals);
    } catch (error) {
        console.error("Error fetching deals:", error);
        toast({
            variant: "destructive",
            title: "Error fetching deals",
            description: "Could not retrieve deals data.",
        });
    } finally {
        setLoading(false);
    }
}, [firestore, toast]);
  
  useEffect(() => {
    if (firestore) {
      fetchDeals();
    }
  }, [fetchDeals, firestore]);

  const handleDeleteDeal = async (dealId: string) => {
    if (!firestore) return;
    try {
        await deleteDeal(firestore, dealId);
        toast({
            title: "Deal Deleted",
            description: "The deal has been successfully removed.",
        });
        fetchDeals(); // Refresh the list
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Deleting Deal",
            description: error.message || "An unexpected error occurred.",
        });
    }
  }

  const renderMobileCards = () => (
    <div className="space-y-4">
        {deals.map(deal => (
             <Card key={deal.id}>
                <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{deal.name}</p>
                            <p className="text-sm text-muted-foreground">PKR {deal.dealPrice.toFixed(2)}</p>
                        </div>
                        <Badge variant={deal.isActive ? 'default' : 'secondary'}>{deal.isActive ? 'Active' : 'Draft'}</Badge>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Link href={`/admin/deals/${deal.id}/edit`}>
                            <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this deal.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDeleteDeal(deal.id)}
                                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                    Continue
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
  );

  const renderDesktopTable = () => (
     <Table>
        <TableHeader>
        <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead># of Products</TableHead>
            <TableHead>
                <span className="sr-only">Actions</span>
            </TableHead>
        </TableRow>
        </TableHeader>
        <TableBody>
            {deals.map((deal) => {
                return (
                    <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.name}</TableCell>
                        <TableCell><Badge variant={deal.isActive ? 'default' : 'secondary'}>{deal.isActive ? 'Active' : 'Draft'}</Badge></TableCell>
                        <TableCell>PKR {deal.dealPrice.toFixed(2)}</TableCell>
                        <TableCell>{deal.products.length}</TableCell>
                        <TableCell className="text-right">
                            <Link href={`/admin/deals/${deal.id}/edit`}>
                                <Button variant="ghost" size="sm">Edit</Button>
                            </Link>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80">
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this deal.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDeleteDeal(deal.id)}
                                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                    >
                                        Continue
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
          <CardTitle>Deal List</CardTitle>
          <CardDescription>{!loading ? `Showing ${deals.length} deals.` : 'Loading...'}</CardDescription>
      </CardHeader>
      <CardContent>
          {loading || isMobile === undefined ? (
              <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 md:h-12 w-full" />
                  ))}
              </div>
          ) : deals.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                      <p>No deals found.</p>
                      <p className="text-muted-foreground text-sm">Try adding a new deal.</p>
                  </TableCell>
              </TableRow>
          ) : (
              isMobile ? renderMobileCards() : renderDesktopTable()
          )}
      </CardContent>
    </Card>
  );
}
