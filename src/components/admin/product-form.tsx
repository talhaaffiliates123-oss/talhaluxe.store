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
import Image from 'next/image';
import { Loader, Upload, X } from 'lucide-react';
import { uploadImage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  discountedPrice: z.coerce.number().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  imageUrls: z.array(z.string().url("Must be a valid URL")).default([]),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  onSale: z.boolean().default(false),
  rating: z.coerce.number().min(0).max(5).default(0),
  reviews: z.array(z.any()).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
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
      reviews: initialData?.reviews ?? [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "imageUrls"
  });

  const isEditMode = !!initialData;

  const handleAddUrl = () => {
    if (newImageUrl && z.string().url().safeParse(newImageUrl).success) {
      append(newImageUrl);
      setNewImageUrl('');
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid URL',
            description: 'Please enter a valid image URL.',
        })
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !storage) {
        toast({ variant: 'destructive', title: 'Upload failed', description: 'Please select a file to upload.'});
        return;
    }
    
    setIsUploading(true);
    try {
        const uniqueId = uuidv4();
        const filePath = `products/${uniqueId}-${imageFile.name}`;
        const imageUrl = await uploadImage(storage, imageFile, filePath);
        append(imageUrl);
        setImageFile(null);
        toast({ title: 'Success', description: 'Image uploaded successfully.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Upload failed', description: 'Could not upload image.'});
    } finally {
        setIsUploading(false);
    }
  }


  const onSubmit = async (data: ProductFormData) => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firebase services not available.' });
        return;
    }
    
    setIsSubmitting(true);

    try {
        const productData = {
            ...data,
            discountedPrice: data.discountedPrice || null,
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
                    <Label htmlFor="image-url">Product Images</Label>
                    {/* Image URL Input */}
                    <div className="flex gap-2 items-start">
                        <Input 
                        id="image-url-input" 
                        placeholder="Paste an image URL"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        />
                        <Button type="button" variant="outline" onClick={handleAddUrl}>Add URL</Button>
                    </div>

                    {/* Image File Upload */}
                    <div className="mt-2 flex gap-2 items-start">
                        <Input 
                            id="image-file-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                            className="flex-grow"
                        />
                         <Button type="button" variant="outline" onClick={handleImageUpload} disabled={!imageFile || isUploading}>
                            {isUploading ? <Loader className="animate-spin" /> : <Upload />}
                            <span className="ml-2">Upload</span>
                        </Button>
                    </div>

                    {errors.imageUrls && <p className="text-destructive text-sm mt-1">{errors.imageUrls.message}</p>}
                    
                    {fields.length > 0 && (
                        <div className="mt-4">
                            <Label className="mb-2 block">Current Images</Label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {fields.map((field, index) => (
                                   <div key={field.id} className="relative group">
                                        <Image src={field.value || 'https://placehold.co/100x100/EEE/31343C?text=New'} alt={`Product image ${index + 1}`} width={100} height={100} className="rounded-md object-cover w-full aspect-square" onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100/EEE/31343C?text=Invalid'}/>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => remove(index)}
                                            disabled={isSubmitting}
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
        
        <Button type="submit" size="lg" disabled={isSubmitting || isUploading} className="w-full">
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Product')}
        </Button>
      </div>
    </form>
  );
}
