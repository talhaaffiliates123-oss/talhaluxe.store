'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
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
      </div>
    </div>
  );
}
