'use client';
import OrdersTable from '@/components/admin/orders/orders-table';

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage all orders in your store.</p>
        </div>
      </div>
      <OrdersTable />
    </div>
  );
}
