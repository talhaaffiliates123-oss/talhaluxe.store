'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Package, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { products as seedProducts } from '@/lib/data';
import { seedDatabase } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore not available.',
      });
      return;
    }

    setIsSeeding(true);
    toast({
      title: 'Seeding database...',
      description: 'This may take a moment. Please wait.',
    });

    try {
      await seedDatabase(firestore, seedProducts);

      toast({
        title: 'Success!',
        description: 'Database has been seeded with product data.',
      });
      // Maybe force a refresh or redirect to ensure product list is updated
      window.location.reload();
    } catch (error: any) {
      console.error("Seeding error:", error);
      toast({
        variant: 'destructive',
        title: 'Error seeding database',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
        setIsSeeding(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, Admin</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>Add, edit, and view all products in your store.</CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/admin/products">
                    <Button variant="secondary">
                        <Package className="mr-2 h-4 w-4" />
                        Go to Products
                    </Button>
                </Link>
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Seed Database</CardTitle>
            <CardDescription>
              Populate your Firestore database with initial product data. This will delete all existing products and images.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSeed} disabled={isSeeding} variant="secondary">
              <Database className="mr-2 h-4 w-4" />
              {isSeeding ? 'Seeding...' : 'Seed Products'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
