'use client';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { getProducts } from '@/lib/products';
import { Product } from '@/lib/types';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
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
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AdminProductsPage() {
  const firestore = useFirestore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (firestore) {
        setLoading(true);
        const productsData = await getProducts(firestore);
        setProducts(productsData);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [firestore]);

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
                ) : products.map((product) => {
                    const image = PlaceHolderImages.find(img => img.id === product.imageIds[0]);
                    return (
                        <TableRow key={product.id}>
                            <TableCell className="hidden sm:table-cell">
                            {image ? (
                                <Image
                                    alt={product.name}
                                    className="aspect-square rounded-md object-cover"
                                    height="64"
                                    src={image.imageUrl}
                                    width="64"
                                    data-ai-hint={image.imageHint}
                                />
                            ) : <div className='aspect-square w-16 bg-muted rounded-md'/>}
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                                {product.stock > 0 ? <Badge variant="outline">In stock</Badge> : <Badge variant="destructive">Out of stock</Badge>}
                            </TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                            <TableCell>
                                <Link href={`/admin/products/${product.id}/edit`}>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </Link>
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
