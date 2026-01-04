'use client';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { getProducts, deleteProduct } from '@/lib/products';
import { Product } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function AdminProductsPage() {
  const firestore = useFirestore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    if (firestore) {
      setLoading(true);
      const productsData = await getProducts(firestore);
      setProducts(productsData);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [firestore]);

  const handleDeleteProduct = async (productId: string) => {
    if (!firestore) return;
    try {
        await deleteProduct(firestore, productId);
        toast({
            title: "Product Deleted",
            description: "The product has been successfully removed.",
        });
        // Refresh the product list after deletion
        fetchProducts();
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Deleting Product",
            description: error.message || "An unexpected error occurred.",
        });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage all products in your store.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>{products.length} products found.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                    </TableHead>
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
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading products...</TableCell>
                    </TableRow>
                ) : products.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                            <p>No products found.</p>
                            <p className="text-muted-foreground text-sm">Try seeding the database from the main admin page.</p>
                        </TableCell>
                    </TableRow>
                ) : products.map((product) => {
                    const imageUrl = product.imageUrls?.[0] || 'https://placehold.co/64x64/EEE/31343C?text=No+Image';
                    return (
                        <TableRow key={product.id}>
                            <TableCell className="hidden sm:table-cell">
                                <Image
                                    alt={product.name}
                                    className="aspect-square rounded-md object-cover"
                                    height="64"
                                    src={imageUrl}
                                    width="64"
                                />
                            </TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
