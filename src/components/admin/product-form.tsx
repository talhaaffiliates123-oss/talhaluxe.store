
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
import { useFirestore } from '@/firebase';
import { addProduct, updateProduct } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from '@/components/ui/card';
import { useState, useRef } from 'react';
import { PlusCircle, Trash2, X, UploadCloud } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';


const variantSchema = z.object({
  id: z.string().default(() => uuidv4()),
  type: z.string().min(1, 'Variant type is required'),
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
  imageUrls: z.array(z.object({ value: z.string().url("Must be a valid URL") })).optional().default([]),
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
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...initialData,
      price: initialData?.price ?? 0,
      discountedPrice: initialData?.discountedPrice ?? null,
      shippingCost: initialData?.shippingCost ?? 0,
      rating: initialData?.rating ?? 0,
      imageUrls: initialData?.imageUrls?.map(url => ({ value: url })) ?? [],
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    let uploadedCount = 0;
    
    for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Upload failed');
            }

            const result = await response.json();
            appendImageUrl({ value: result.url });
            uploadedCount++;

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: `Could not upload ${file.name}: ${error.message}`,
            });
        }
    }
    
    setIsUploading(false);
    toast({
        title: 'Upload Complete',
        description: `${uploadedCount} of ${files.length} images uploaded successfully.`,
    });
    event.target.value = '';
  };

  const handleVariantImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Upload failed');
        }

        const result = await response.json();
        setValue(`variants.${index}.imageUrl`, result.url, { shouldValidate: true });

        toast({
            title: 'Variant Image Uploaded',
            description: 'The image has been linked to the variant.',
        });

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: error.message,
        });
    } finally {
        setIsUploading(false);
        event.target.value = '';
    }
};

  const onSubmit = async (data: ProductFormData) => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firebase services not available.' });
        return;
    }
    
    setIsSubmitting(true);

    try {
        const hasVariants = data.variants && data.variants.length > 0;
        const totalStock = hasVariants
            ? data.variants.reduce((acc, variant) => acc + variant.stock, 0)
            : data.stock;
        
        const plainImageUrls = data.imageUrls?.map(img => img.value) || [];
        const variantImageUrls = data.variants?.map(v => v.imageUrl).filter(Boolean) as string[] || [];
        const combinedImageUrls = [...new Set([...plainImageUrls, ...variantImageUrls])];

        if (combinedImageUrls.length === 0) {
            toast({ variant: 'destructive', title: 'Validation Error', description: "A product must have at least one image." });
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
            await updateProduct(firestore, initialData.id, productData as any);
            toast({ title: 'Success', description: 'Product updated successfully.' });
        } else {
            await addProduct(firestore, productData as any);
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
                    {errors.name && <p className="text-destructive text-sm mt-1">{String(errors.name.message)}</p>}
                </div>
                <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Input id="shortDescription" {...register('shortDescription')} />
                    {errors.shortDescription && <p className="text-destructive text-sm mt-1">{String(errors.shortDescription.message)}</p>}
                </div>
                <div>
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea id="description" {...register('description')} rows={5} />
                    {errors.description && <p className="text-destructive text-sm mt-1">{String(errors.description.message)}</p>}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Image Upload</CardTitle>
                <CardDescription>Upload JPG or PNG files. They will be added to the image URL list below.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="image-upload">Upload Main Images</Label>
                    <Input 
                        id="image-upload" 
                        type="file" 
                        multiple 
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                    />
                </div>
                {isUploading && <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2"><UploadCloud className="animate-pulse" />Uploading images...</p>}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Add or remove image URLs for this product.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {imageUrlsFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <Input 
                            {...register(`imageUrls.${index}.value`)}
                            placeholder="https://example.com/image.png"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeImageUrl(index)}>
                        <X className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                    ))}
                    <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendImageUrl({ value: "" })}
                    >
                    Add Image URL
                    </Button>
                     {(errors.imageUrls as any) && <p className="text-destructive text-sm mt-1">{String((errors.imageUrls as any).message)}</p>}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>Add product variants like different colors or sizes. Each variant requires an image URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {variantsFields.map((field, index) => {
                    const imageUrl = watch(`variants.${index}.imageUrl`);
                    return (
                        <div key={field.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-start gap-4">
                                {imageUrl && (
                                    <img src={imageUrl} alt="Variant" className="w-16 h-16 object-cover rounded-md border" />
                                )}
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                    <div>
                                        <Label htmlFor={`variants.${index}.type`}>Type</Label>
                                        <Input {...register(`variants.${index}.type`)} id={`variants.${index}.type`} placeholder="e.g. Color" />
                                    </div>
                                    <div>
                                        <Label htmlFor={`variants.${index}.name`}>Value</Label>
                                        <Input {...register(`variants.${index}.name`)} id={`variants.${index}.name`} placeholder="e.g. Black" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor={`variants.${index}.imageUrl`}>Variant Image URL</Label>
                                <div className="flex items-center gap-2">
                                    <Input {...register(`variants.${index}.imageUrl`)} id={`variants.${index}.imageUrl`} />
                                    <Label htmlFor={`variant-upload-${index}`} className={cn(buttonVariants({ variant: "outline", size: "icon" }), "cursor-pointer")}>
                                        <UploadCloud className="h-4 w-4" />
                                        <span className="sr-only">Upload variant image</span>
                                    </Label>
                                    <Input 
                                        id={`variant-upload-${index}`}
                                        type="file" 
                                        className="hidden"
                                        accept="image/jpeg, image/png, image/webp"
                                        onChange={(e) => handleVariantImageUpload(e, index)}
                                        disabled={isUploading}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <Label htmlFor={`variants.${index}.stock`}>Stock</Label>
                                    <Input type="number" {...register(`variants.${index}.stock`)} id={`variants.${index}.stock`} />
                                </div>
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeVariant(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            {(errors.variants as any)?.[index]?.type && (
                                <p className="text-destructive text-sm">{String((errors.variants as any)[index]?.type?.message)}</p>
                            )}
                            {(errors.variants as any)?.[index]?.name && (
                                <p className="text-destructive text-sm">{String((errors.variants as any)[index]?.name?.message)}</p>
                            )}
                             {(errors.variants as any)?.[index]?.imageUrl && (
                                <p className="text-destructive text-sm mt-1">{String((errors.variants as any)[index]?.imageUrl?.message)}</p>
                            )}
                            {(errors.variants as any)?.[index]?.stock && (
                                <p className="text-destructive text-sm">{String((errors.variants as any)[index]?.stock?.message)}</p>
                            )}
                        </div>
                    );
                })}
                <Button type="button" variant="outline" onClick={() => appendVariant({ id: uuidv4(), type: '', name: '', stock: 0, imageUrl: '' })}>
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
                        {errors.price && <p className="text-destructive text-sm mt-1">{String(errors.price.message)}</p>}
                    </div>
                    <div>
                        <Label htmlFor="discountedPrice">Discounted Price (PKR)</Label>
                        <Input id="discountedPrice" type="number" step="0.01" {...register('discountedPrice')} />
                        {errors.discountedPrice && <p className="text-destructive text-sm mt-1">{String(errors.discountedPrice.message)}</p>}
                    </div>
                </div>
                 <div>
                    <Label htmlFor="shippingCost">Shipping Cost (PKR)</Label>
                    <Input id="shippingCost" type="number" step="0.01" {...register('shippingCost')} />
                    {errors.shippingCost && <p className="text-destructive text-sm mt-1">{String(errors.shippingCost.message)}</p>}
                </div>
                <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" type="number" {...register('stock')} disabled={hasVariants} />
                    {hasVariants ? (
                        <p className="text-xs text-muted-foreground mt-1">Total stock is automatically calculated from variants.</p>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-1">Enter stock if product has no variants.</p>
                    )}
                    {errors.stock && <p className="text-destructive text-sm mt-1">{String(errors.stock.message)}</p>}
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
                    {errors.category && <p className="text-destructive text-sm mt-1">{String(errors.category.message)}</p>}
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
        
        <Button type="submit" size="lg" disabled={isSubmitting || isUploading || !firestore} className="w-full">
          {isUploading ? 'Uploading...' : isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Product')}
        </Button>
      </div>
    </form>
  );
}
