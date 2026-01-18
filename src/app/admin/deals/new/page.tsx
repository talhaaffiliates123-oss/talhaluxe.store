
import DealForm from '@/components/admin/deals/deal-form';

export default function NewDealPage() {
  return (
    <div>
      <div className="mb-6">
          <h1 className="text-3xl font-bold">Add New Deal</h1>
          <p className="text-muted-foreground">Fill in the details below to create a new product deal or bundle.</p>
        </div>
      <DealForm />
    </div>
  );
}
