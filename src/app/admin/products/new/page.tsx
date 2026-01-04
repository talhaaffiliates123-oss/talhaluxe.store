import ProductForm from '@/components/admin/product-form';

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">Fill in the details below to add a new product to your store.</p>
        </div>
      <ProductForm />
    </div>
  );
}
