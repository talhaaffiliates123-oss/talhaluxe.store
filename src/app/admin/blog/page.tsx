'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import BlogPostsTable from '@/components/admin/blog/blog-posts-table';
import { useFirestore } from '@/firebase';
import { seedBlogPosts } from '@/lib/seed-blogs';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AdminBlogPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSeed = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    const result = await seedBlogPosts(firestore);
    if (result.success) {
      toast({ title: 'Success!', description: result.message });
      setRefreshKey(prev => prev + 1); // Refresh the table
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsSeeding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Manage all blog posts for your store.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSeed} disabled={isSeeding}>
                {isSeeding ? 'Seeding...' : 'Seed Initial Posts'}
            </Button>
            <Button asChild>
              <Link href="/admin/blog/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Post
              </Link>
            </Button>
        </div>
      </div>
      <BlogPostsTable key={refreshKey} />
    </div>
  );
}
