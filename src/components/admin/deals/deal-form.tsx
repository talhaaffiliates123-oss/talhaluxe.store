
'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Deal, Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { getProducts } from '@/lib/products';
import { addDeal, updateDeal } from '@/lib/deals';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Search, Trash2 } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

const dealSchema = z.object({
  name: z.string().min(1, 'Deal name is required'),
  description: z.string().min(1, 'Description is required'),
  dealPrice: z.coerce.number().positive('Deal price must be a positive number'),
  isActive: z.boolean().default(false),
  products: z.array(z.any()).min(1, 'A deal must have at least one product.'),
});

type DealFormData = z.infer<typeof dealSchema>;

interface DealFormProps {
  initialData?: Deal;
}

const ProductSelector = ({ onProductSelect }: { onProductSelect: (product: Product) => void }) => {
    const firestore = useFirestore();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (firestore) {
            getProducts(firestore).then(prods => {
                setAllProducts(prods);
                setLoading(false);
            });
        }
    }, [firestore]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return allProducts;
        return allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allProducts, searchTerm]);

    return (
        <div className="p-4">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {loading ? <p>Loading products...</p> : 
                    filteredProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-3">
                                <Image src={product.imageUrls[0]} alt={product.name} width={40} height={40} className="rounded-md object-cover"/>
                                <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">PKR {product.price}</p>
                                </div>
                            </div>
                            <DrawerClose asChild>
                                <Button size="sm" onClick={() => onProductSelect(product)}>Add</Button>
                            </DrawerClose>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default function DealForm({ initialData }: DealFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      dealPrice: 0,
      isActive: false,
      products: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products"
  });

  const handleProductSelect = (product: Product) => {
    // Create a deep copy to prevent modifying the original product object
    const productCopy = JSON.parse(JSON.stringify(product));
    append(productCopy);
  };
  
  const onSubmit = async (data: DealFormData) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firebase services not available.' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateDeal(firestore, initialData.id, data);
        toast({ title: 'Success', description: 'Deal updated successfully.' });
      } else {
        await addDeal(firestore, data);
        toast({ title: 'Success', description: 'Deal created successfully.' });
      }
      
      router.push('/admin/deals');
      router.refresh();

    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({ variant: 'destructive', title: 'Operation Failed', description: error.message || "An unknown error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Deal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Deal Name</Label>
                            <Input id="name" {...register('name')} />
                            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description')} rows={3} />
                            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Products in this Deal</CardTitle>
                        <CardDescription>Add products from your store. You can edit their details for this deal specifically.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                           <Card key={field.id} className="p-4">
                             <div className="flex justify-between items-start">
                                <div>
                                    <Label>Product Name</Label>
                                    <Input {...register(`products.${index}.name`)} />
                                </div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                             </div>
                             <div className="mt-2">
                                <Label>Price in Deal (PKR)</Label>
                                <Input type="number" {...register(`products.${index}.price`)} />
                             </div>
                             {/* Simplified image and variant editor can be added here if needed */}
                           </Card>
                        ))}
                         <Drawer>
                            <DrawerTrigger asChild>
                                <Button type="button" variant="outline" className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Product to Deal
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader>
                                    <DrawerTitle>Select a Product</DrawerTitle>
                                </DrawerHeader>
                                <ProductSelector onProductSelect={handleProductSelect} />
                            </DrawerContent>
                        </Drawer>
                        {errors.products && <p className="text-destructive text-sm mt-1">{errors.products.message}</p>}
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing & Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="dealPrice">Total Deal Price (PKR)</Label>
                            <Input id="dealPrice" type="number" step="0.01" {...register('dealPrice')} />
                            {errors.dealPrice && <p className="text-destructive text-sm mt-1">{errors.dealPrice.message}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id="isActive" checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor="isActive">Activate Deal</Label>
                        </div>
                    </CardContent>
                </Card>
                 <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Deal')}
                </Button>
            </div>
        </div>
    </form>
  );
}
