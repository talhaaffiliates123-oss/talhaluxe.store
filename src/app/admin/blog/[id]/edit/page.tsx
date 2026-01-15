
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BlogPostForm from '@/components/admin/blog/blog-post-form';
import { useFirestore } from '@/firebase';
import { getBlogPost } from '@/lib/blog';
import { BlogPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBlogPostPage() {
  const { id } = useParams();
  const firestore = useFirestore();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firestore && id) {
      getBlogPost(firestore, id as string).then((postData) => {
        setPost(postData);
        setLoading(false);
      });
    }
  }, [firestore, id]);

  if (loading) {
    return (
        <div>
            <div className="mb-6 space-y-2">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
  }

  if (!post) {
    return <div>Blog post not found.</div>;
  }

  return (
    <div>
       <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Blog Post</h1>
          <p className="text-muted-foreground">Update the details for &quot;{post.title}&quot;.</p>
        </div>
      <BlogPostForm initialData={post} />
    </div>
  );
}
