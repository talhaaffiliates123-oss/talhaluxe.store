
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { BlogPost } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { addBlogPost, updateBlogPost } from '@/lib/blog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { format } from 'date-fns';

// Zod schema for form validation
const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes only'),
  summary: z.string().min(1, 'Summary is required'),
  author: z.string().min(1, 'Author is required'),
  date: z.string().min(1, 'Date is required'),
  imageUrl: z.string().url('Must be a valid URL'),
  imageHint: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
  initialData?: BlogPost;
}

export default function BlogPostForm({ initialData }: BlogPostFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: initialData || {
      title: '',
      slug: '',
      summary: '',
      author: 'Talha Luxe Staff',
      date: format(new Date(), 'MMMM dd, yyyy'),
      imageUrl: '',
      imageHint: '',
      content: '',
    },
  });

  const titleValue = watch('title');

  const generateSlug = () => {
    const slug = titleValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters
      .replace(/\s+/g, '-')           // replace spaces with hyphens
      .replace(/-+/g, '-');          // remove consecutive hyphens
    setValue('slug', slug);
  };

  const onSubmit = async (data: BlogPostFormData) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firebase services not available.' });
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (isEditMode && initialData) {
        await updateBlogPost(firestore, initialData.id, {
          ...data,
          imageHint: data.imageHint || '',
        });
        toast({ title: 'Success', description: 'Blog post updated successfully.' });
      } else {
        await addBlogPost(firestore, {
          ...data,
          imageHint: data.imageHint || '',
        });
        toast({ title: 'Success', description: 'Blog post added successfully.' });
      }
      
      router.push('/admin/blog');
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
        <Card>
            <CardHeader>
                <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="title">Post Title</Label>
                        <Input id="title" {...register('title')} />
                        {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="flex-grow">
                            <Label htmlFor="slug">Post Slug</Label>
                            <Input id="slug" {...register('slug')} placeholder="example-post-slug" />
                            {errors.slug && <p className="text-destructive text-sm mt-1">{errors.slug.message}</p>}
                        </div>
                        <Button type="button" variant="outline" onClick={generateSlug}>Generate</Button>
                    </div>
                </div>

                <div>
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea id="summary" {...register('summary')} rows={3} />
                    {errors.summary && <p className="text-destructive text-sm mt-1">{errors.summary.message}</p>}
                </div>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="author">Author</Label>
                        <Input id="author" {...register('author')} />
                        {errors.author && <p className="text-destructive text-sm mt-1">{errors.author.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" {...register('date')} />
                        {errors.date && <p className="text-destructive text-sm mt-1">{errors.date.message}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" {...register('imageUrl')} placeholder="https://images.unsplash.com/..."/>
                    {errors.imageUrl && <p className="text-destructive text-sm mt-1">{errors.imageUrl.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="imageHint">Image Hint (for AI)</Label>
                    <Input id="imageHint" {...register('imageHint')} placeholder="e.g., 'person writing'"/>
                    <p className="text-xs text-muted-foreground mt-1">
                        A short, 1-2 word hint to help AI understand the image context.
                    </p>
                    {errors.imageHint && <p className="text-destructive text-sm mt-1">{errors.imageHint.message}</p>}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    <Label htmlFor="content">Post Content (HTML)</Label>
                    <Textarea id="content" {...register('content')} rows={15} placeholder="<p>Start writing your blog post here...</p>"/>
                    <p className="text-xs text-muted-foreground mt-1">
                        Use HTML tags for formatting (e.g., `&lt;p&gt;`, `&lt;h3&gt;`, `&lt;ul&gt;`, `&lt;li&gt;`, `&lt;strong&gt;`).
                    </p>
                    {errors.content && <p className="text-destructive text-sm mt-1">{errors.content.message}</p>}
                </div>
            </CardContent>
        </Card>
        
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Publish Post')}
        </Button>
    </form>
  );
}
