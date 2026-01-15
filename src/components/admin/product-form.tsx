
'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { categories } from '@/lib/data';
import type { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useFirestore, useStorage } from '@/firebase';
import { addProduct, updateProduct } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from '@/components/ui/card';
import { useState } from 'react';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const variantSchema = z.object({
  id: z.string().default(() => uuidv4()),
  name: z.string().min(1, 'Variant name is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  imageUrl: z.string().url("Image URL must be a valid URL"),
});

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  discountedPrice: z.coerce.number().optional().nullable(),
  shippingCost: z.coerce.number().min(0, 'Shipping cost cannot be negative').optional().default(0),
  category: z.string().min(1, 'Category is required'),
  imageUrls: z.array(z.string().url("Must be a valid URL")).optional().default([]),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  onSale: z.boolean().default(false),
  rating: z.coerce.number().min(0).max(5).default(0),
  reviewCount: z.coerce.number().min(0).optional(),
  reviews: z.array(z.any()).optional(),
  variants: z.array(variantSchema).optional().default([]),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...initialData,
      price: initialData?.price ?? 0,
      discountedPrice: initialData?.discountedPrice ?? null,
      shippingCost: initialData?.shippingCost ?? 0,
      rating: initialData?.rating ?? 0,
      imageUrls: initialData?.imageUrls ?? [],
      category: initialData?.category ?? '',
      reviews: initialData?.reviews ?? [],
      variants: initialData?.variants?.map(v => ({ ...v, imageUrl: v.imageUrl || '' })) ?? [],
      stock: initialData?.stock ?? 0,
    },
  });
  
  const { fields: imageUrlsFields, append: appendImageUrl, remove: removeImageUrl } = useFieldArray({
    control,
    name: "imageUrls"
  });

  const { fields: variantsFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants"
  });

  const isEditMode = !!initialData;

  const onSubmit = async (data: ProductFormData) => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firebase services not available.' });
        return;
    }
    
    setIsSubmitting(true);

    try {
        const hasVariants = data.variants && data.variants.length > 0;
        // Calculate total stock from variants if they exist, otherwise use the main stock field
        const totalStock = hasVariants
            ? data.variants.reduce((acc, variant) => acc + variant.stock, 0)
            : data.stock;
        
        // If there are variants, ensure their image URLs are in the main imageUrls array.
        const variantImageUrls = data.variants?.map(v => v.imageUrl).filter(Boolean) as string[] || [];
        const combinedImageUrls = [...new Set([...(data.imageUrls || []), ...variantImageUrls])];

        if (!hasVariants && combinedImageUrls.length === 0) {
            toast({ variant: 'destructive', title: 'Validation Error', description: "A product must have at least one image if it has no variants." });
            setIsSubmitting(false);
            return;
        }


        const productData = {
            ...data,
            discountedPrice: data.discountedPrice || null,
            shippingCost: data.shippingCost || 0,
            stock: totalStock,
            imageUrls: combinedImageUrls,
        };

        if (isEditMode) {
            await updateProduct(firestore, initialData.id, productData);
            toast({ title: 'Success', description: 'Product updated successfully.' });
        } else {
            await addProduct(firestore, productData);
            toast({ title: 'Success', description: 'Product added successfully.' });
        }
        
        router.push('/admin/products');
        router.refresh();

    } catch (error: any) {
        console.error("Form submission error:", error);
        toast({ variant: 'destructive', title: 'Operation Failed', description: error.message || "An unknown error occurred." });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const variants = watch('variants');
  const hasVariants = variants && variants.length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Fill out the main details for your product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Input id="shortDescription" {...register('shortDescription')} />
                    {errors.shortDescription && <p className="text-destructive text-sm mt-1">{errors.shortDescription.message}</p>}
                </div>
                <div>
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea id="description" {...register('description')} rows={5} />
                    {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Add URLs for the product images. If product has no variants, at least one image is required.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {imageUrlsFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <Controller
                            render={({ field }) => <Input {...field} placeholder="https://example.com/image.png" />}
                            name={`imageUrls.${index}`}
                            control={control}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeImageUrl(index)}>
                        <X className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                    ))}
                    <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendImageUrl("")}
                    >
                    Add Image URL
                    </Button>
                     {errors.imageUrls && <p className="text-destructive text-sm mt-1">{errors.imageUrls.message}</p>}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>Add product variants like different colors or sizes. Each variant requires an image URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {variantsFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 border rounded-lg">
                        <div className="col-span-full">
                            <Label htmlFor={`variants.${index}.name`}>Variant Name (e.g., Black, Large)</Label>
                            <Input {...register(`variants.${index}.name`)} id={`variants.${index}.name`} />
                        </div>
                        <div className="col-span-full">
                            <Label htmlFor={`variants.${index}.imageUrl`}>Variant Image URL</Label>
                            <Input {...register(`variants.${index}.imageUrl`)} id={`variants.${index}.imageUrl`} />
                        </div>
                        <div className="flex items-end gap-2 col-span-full">
                            <div>
                                <Label htmlFor={`variants.${index}.stock`}>Stock</Label>
                                <Input type="number" {...register(`variants.${index}.stock`)} id={`variants.${index}.stock`} />
                            </div>
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeVariant(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                         {errors.variants?.[index]?.name && <p className="text-destructive text-sm mt-1 col-span-full">{errors.variants[index]?.name?.message}</p>}
                         {errors.variants?.[index]?.stock && <p className="text-destructive text-sm mt-1 col-span-full">{errors.variants[index]?.stock?.message}</p>}
                         {errors.variants?.[index]?.imageUrl && <p className="text-destructive text-sm mt-1 col-span-full">{errors.variants[index]?.imageUrl?.message}</p>}
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendVariant({ id: uuidv4(), name: '', stock: 0, imageUrl: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Variant
                </Button>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="price">Price (PKR)</Label>
                        <Input id="price" type="number" step="0.01" {...register('price')} />
                        {errors.price && <p className="text-destructive text-sm mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="discountedPrice">Discounted Price (PKR)</Label>
                        <Input id="discountedPrice" type="number" step="0.01" {...register('discountedPrice')} />
                        {errors.discountedPrice && <p className="text-destructive text-sm mt-1">{errors.discountedPrice.message}</p>}
                    </div>
                </div>
                 <div>
                    <Label htmlFor="shippingCost">Shipping Cost (PKR)</Label>
                    <Input id="shippingCost" type="number" step="0.01" {...register('shippingCost')} />
                    {errors.shippingCost && <p className="text-destructive text-sm mt-1">{errors.shippingCost.message}</p>}
                </div>
                <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" type="number" {...register('stock')} disabled={hasVariants} />
                    {hasVariants ? (
                        <p className="text-xs text-muted-foreground mt-1">Total stock is automatically calculated from variants.</p>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-1">Enter stock if product has no variants.</p>
                    )}
                    {errors.stock && <p className="text-destructive text-sm mt-1">{errors.stock.message}</p>}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="category">Category</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.slug}>
                                        {c.name}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.category && <p className="text-destructive text-sm mt-1">{errors.category.message}</p>}
                </div>

                <div className="flex items-center space-x-2">
                    <Controller
                        name="isNewArrival"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id="isNewArrival" checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label htmlFor="isNewArrival">New Arrival</Label>
                </div>
                <div className="flex items-center space-x-2">
                     <Controller
                        name="isBestSeller"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id="isBestSeller" checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label htmlFor="isBestSeller">Best Seller</Label>
                </div>
                 <div className="flex items-center space-x-2">
                     <Controller
                        name="onSale"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id="onSale" checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label htmlFor="onSale">On Sale</Label>
                </div>
            </CardContent>
        </Card>
        
        <Button type="submit" size="lg" disabled={isSubmitting || !firestore} className="w-full">
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Product')}
        </Button>
      </div>
    </form>
  );
}
