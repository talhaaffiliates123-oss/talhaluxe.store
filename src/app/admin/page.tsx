
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Package, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { products as seedProducts } from '@/lib/data';
import { addProduct } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSeed = async () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore not available.',
      });
      return;
    }

    try {
      toast({
        title: 'Seeding database...',
        description: 'This may take a moment.',
      });

      for (const product of seedProducts) {
        await addProduct(firestore, product);
      }

      toast({
        title: 'Success!',
        description: 'Database has been seeded with product data.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error seeding database',
        description: error.message,
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/products">
            <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">Manage Products</div>
                <p className="text-xs text-muted-foreground">
                Add, edit, and view all products in your store.
                </p>
            </CardContent>
            </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seed Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Click to populate your Firestore database with the initial product data.
            </p>
            <Button onClick={handleSeed}>Seed Products</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
