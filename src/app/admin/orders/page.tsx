'use client';
import { useState } from 'react';
import OrdersTable from '@/components/admin/orders/orders-table';
import { Input } from '@/components/ui/input';

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage all orders in your store.</p>
        </div>
        <div className="w-full max-w-sm">
           <Input 
              placeholder="Search by name or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>
      <OrdersTable searchTerm={searchTerm} />
    </div>
  );
}
