
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
    CardFooter,
  } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useEffect, useState, useCallback } from 'react';
import { Product } from '@/lib/types';
import { deleteProduct, getPaginatedProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DocumentData, DocumentSnapshot, collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const PAGE_SIZE = 10;

export default function ProductsTable() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<DocumentData, DocumentData> | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = useCallback(async (direction: 'next' | 'initial' = 'initial') => {
    if (!firestore) return;
    setLoading(true);

    try {
        const baseQuery = query(collection(firestore, 'products'), orderBy('name', 'asc'));
        let q;

        if (direction === 'next' && lastVisible) {
            q = query(baseQuery, startAfter(lastVisible), limit(PAGE_SIZE));
        } else {
            q = query(baseQuery, limit(PAGE_SIZE));
        }
        
        const documentSnapshots = await getDocs(q);
        const newProducts = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        if (!documentSnapshots.empty) {
            if (direction === 'initial') {
                setProducts(newProducts);
            } else { // next
                setProducts(prev => [...prev, ...newProducts]);
            }
            setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
        } else if (direction === 'initial') {
            setProducts([]); // No products found at all
        }

        setIsLastPage(documentSnapshots.docs.length < PAGE_SIZE);

    } catch (error) {
        console.error("Error fetching products:", error);
        toast({
            variant: "destructive",
            title: "Error fetching products",
            description: "Could not retrieve product data.",
        });
    } finally {
        setLoading(false);
    }
}, [firestore, lastVisible, toast]);

    // Fetch total count for description
    const fetchTotalCount = useCallback(async () => {
         if(firestore) {
            const coll = collection(firestore, 'products');
            const snap = await getDocs(coll);
            setTotalProducts(snap.size);
        }
    }, [firestore]);
  
  useEffect(() => {
    if (firestore) {
      fetchTotalCount();
      fetchProducts('initial');
    }
  }, [firestore, fetchTotalCount]); // Removed fetchProducts from dependency array

  const handleDeleteProduct = async (productId: string) => {
    if (!firestore) return;
    try {
        await deleteProduct(firestore, productId);
        toast({
            title: "Product Deleted",
            description: "The product has been successfully removed.",
        });
        // Refresh the list from the beginning
        setLastVisible(null);
        setPage(1);
        fetchProducts('initial').then(() => fetchTotalCount());
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Deleting Product",
            description: error.message || "An unexpected error occurred.",
        });
    }
  }

  const handleNextPage = () => {
    if (isLastPage) return;
    setPage(p => p + 1);
    fetchProducts('next');
  }

  const handlePrevPage = () => {
    // A true 'previous' is complex. Resetting to page 1 is the simplest approach.
    setPage(1);
    setLastVisible(null);
    fetchProducts('initial');
  }

  const renderMobileCards = () => (
    <div className="space-y-4">
        {products.map(product => (
            <Card key={product.id}>
                <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-muted-foreground">PKR {product.price.toFixed(2)}</p>
                        </div>
                        {product.stock > 0 ? <Badge variant="outline">In stock</Badge> : <Badge variant="destructive">Out of stock</Badge>}
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
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
                                    This action cannot be undone. This will permanently delete the product
                                    from your database.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDeleteProduct(product.id)}
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
            <TableHead className="hidden md:table-cell">Stock</TableHead>
            <TableHead>
            <span className="sr-only">Actions</span>
            </TableHead>
        </TableRow>
        </TableHeader>
        <TableBody>
            {products.map((product) => {
                return (
                    <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                            {product.stock > 0 ? <Badge variant="outline">In stock</Badge> : <Badge variant="destructive">Out of stock</Badge>}
                        </TableCell>
                        <TableCell>PKR {product.price.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                        <TableCell className="text-right">
                            <Link href={`/admin/products/${product.id}/edit`}>
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
                                        This action cannot be undone. This will permanently delete the product
                                        from your database.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDeleteProduct(product.id)}
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
          <CardTitle>Product List</CardTitle>
          <CardDescription>{!loading ? `Showing ${products.length} of ${totalProducts} products.` : 'Loading...'}</CardDescription>
      </CardHeader>
      <CardContent>
          {loading || isMobile === undefined ? (
              <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full md:h-12" />
                  ))}
              </div>
          ) : products.length === 0 ? (
              <div className="text-center py-10">
                  <p>No products found.</p>
                  <p className="text-muted-foreground text-sm">Try adding a new product.</p>
              </div>
          ) : (
              isMobile ? renderMobileCards() : renderDesktopTable()
          )}
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
