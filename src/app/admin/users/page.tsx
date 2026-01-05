'use client';
import UsersTable from '@/components/admin/users/users-table';

export default function AdminUsersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all registered users.</p>
        </div>
      </div>
      <UsersTable />
    </div>
  );
}
