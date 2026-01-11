'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardStats from '@/components/admin/dashboard-stats';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardStats />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
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
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>View all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/admin/users">
                    <Button variant="secondary">
                        <Users className="mr-2 h-4 w-4" />
                        Go to Users
                    </Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
