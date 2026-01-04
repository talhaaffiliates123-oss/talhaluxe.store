'use client';

import { useForm, Controller } from 'react-hook-form';
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
import { useEffect, useState } from 'react';
import { uploadImages } from '@/lib/storage';
import { getStorage } from 'firebase/storage';
import { Progress } from '../ui/progress';
import Image from 'next/image';
import { X } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  discountedPrice: z.coerce.number().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  imageUrls: z.array(z.string()).optional().default([]), // Keep existing URLs
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  onSale: z.boolean().default(false),
  rating: z.coerce.number().min(0).max(5).default(0)
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...initialData,
      price: initialData?.price ?? 0,
      discountedPrice: initialData?.discountedPrice ?? null,
      stock: initialData?.stock ?? 0,
      rating: initialData?.rating ?? 0,
      imageUrls: initialData?.imageUrls ?? [],
      category: initialData?.category ?? '',
    },
  });
  
  const isEditMode = !!initialData;
  const currentImageUrls = watch('imageUrls');

  useEffect(() => {
    if (files.length > 0) {
      const urls = files.map(file => URL.createObjectURL(file));
      setNewImagePreviews(urls);
      
      // Cleanup function to revoke the object URLs
      return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
        setNewImagePreviews([]);
    }
  }, [files]);

  const handleRemoveImage = (urlToRemove: string) => {
    const updatedUrls = currentImageUrls?.filter(url => url !== urlToRemove);
    setValue('imageUrls', updatedUrls, { shouldValidate: true, shouldDirty: true });
  }

  const onSubmit = async (data: ProductFormData) => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
        return;
    }

    try {
        let finalImageUrls: string[] = data.imageUrls || [];

        // 1. Upload new files if any
        if (files.length > 0) {
            setUploadProgress(0);
            const storage = getStorage();
            const uploadedUrls = await uploadImages(storage, files, (progress) => {
                setUploadProgress(progress);
            });
            finalImageUrls = [...finalImageUrls, ...uploadedUrls];
            setUploadProgress(null);
        }
        
        // 2. Prepare product data, ensuring discountedPrice is a number or null
        const productData = {
            ...data,
            imageUrls: finalImageUrls,
            reviews: initialData?.reviews ?? [],
            discountedPrice: data.discountedPrice || null,
        }

        // 3. Call update or add product
        if (isEditMode) {
            await updateProduct(firestore, initialData.id, productData);
            toast({ title: 'Success', description: 'Product updated successfully.' });
        } else {
            await addProduct(firestore, productData);
            toast({ title: 'Success', description: 'Product added successfully.' });
        }
        
        // 4. Redirect on success
        router.push('/admin/products');
        router.refresh();

    } catch (error: any) {
        console.error("Form submission error:", error);
        toast({ variant: 'destructive', title: 'Operation Failed', description: error.message || "An unknown error occurred." });
        setUploadProgress(null);
    }
  };

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
                 <div>
                    <Label htmlFor="images">Product Images</Label>
                    <Input id="images" type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                    <p className="text-muted-foreground text-sm mt-1">
                        Upload one or more images for the product.
                    </p>
                    {uploadProgress !== null && <Progress value={uploadProgress} className="mt-2" />}
                    
                    {newImagePreviews.length > 0 && (
                        <div className="mt-4">
                             <Label className="mb-2 block">New Images Preview</Label>
                             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {newImagePreviews.map((url, index) => (
                                    <div key={index} className="relative">
                                        <Image src={url} alt={`New image preview ${index + 1}`} width={100} height={100} className="rounded-md object-cover w-full aspect-square" />
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {currentImageUrls && currentImageUrls.length > 0 && (
                        <div className="mt-4">
                            <Label className="mb-2 block">Current Images</Label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {currentImageUrls.map(url => (
                                   <div key={url} className="relative group">
                                        <Image src={url} alt="Existing product image" width={100} height={100} className="rounded-md object-cover w-full aspect-square"/>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveImage(url)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                   </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
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
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" type="number" step="0.01" {...register('price')} />
                        {errors.price && <p className="text-destructive text-sm mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="discountedPrice">Discounted Price (Optional)</Label>
                        <Input id="discountedPrice" type="number" step="0.01" {...register('discountedPrice')} />
                        {errors.discountedPrice && <p className="text-destructive text-sm mt-1">{errors.discountedPrice.message}</p>}
                    </div>
                </div>
                <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" type="number" {...register('stock')} />
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
        
        <Button type="submit" size="lg" disabled={isSubmitting || uploadProgress !== null} className="w-full">
          {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Product')}
        </Button>
      </div>
    </form>
  );
}
