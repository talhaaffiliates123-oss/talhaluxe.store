
'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import DealsTable from '@/components/admin/deals/deals-table';

export default function AdminDealsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Deals & Bundles</h1>
          <p className="text-muted-foreground">Manage all product deals for your store.</p>
        </div>
        <Button asChild>
          <Link href="/admin/deals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Deal
          </Link>
        </Button>
      </div>
      <DealsTable />
    </div>
  );
}
