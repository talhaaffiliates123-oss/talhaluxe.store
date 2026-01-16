
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useEffect, useState, useCallback } from 'react';
import { BlogPost } from '@/lib/types';
import { deleteBlogPost, getBlogPosts } from '@/lib/blog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

export default function BlogPostsTable() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!firestore) return;
    setLoading(true);

    try {
        const fetchedPosts = await getBlogPosts(firestore);
        setPosts(fetchedPosts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
            variant: "destructive",
            title: "Error fetching posts",
            description: "Could not retrieve blog data.",
        });
    } finally {
        setLoading(false);
    }
}, [firestore, toast]);
  
  useEffect(() => {
    if (firestore) {
      fetchPosts();
    }
  }, [fetchPosts, firestore]);

  const handleDeletePost = async (postId: string) => {
    if (!firestore) return;
    try {
        await deleteBlogPost(firestore, postId);
        toast({
            title: "Post Deleted",
            description: "The blog post has been successfully removed.",
        });
        fetchPosts(); // Refresh the list
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Deleting Post",
            description: error.message || "An unexpected error occurred.",
        });
    }
  }

  const renderMobileCards = () => (
    <div className="space-y-4">
        {posts.map(post => (
             <Card key={post.id}>
                <CardContent className="p-4 space-y-3">
                    <div>
                        <p className="font-semibold">{post.title}</p>
                        <p className="text-sm text-muted-foreground">by {post.author} on {post.date}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Link href={`/admin/blog/${post.id}/edit`}>
                            <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this blog post.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDeletePost(post.id)}
                                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                    Continue
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
  );

  const renderDesktopTable = () => (
     <Table>
        <TableHeader>
        <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>
                <span className="sr-only">Actions</span>
            </TableHead>
        </TableRow>
        </TableHeader>
        <TableBody>
            {posts.map((post) => {
                return (
                    <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell>{post.date}</TableCell>
                        <TableCell className="text-right">
                            <Link href={`/admin/blog/${post.id}/edit`}>
                                <Button variant="ghost" size="sm">Edit</Button>
                            </Link>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80">
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this blog post.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDeletePost(post.id)}
                                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                    >
                                        Continue
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
          <CardTitle>Post List</CardTitle>
          <CardDescription>{!loading ? `Showing ${posts.length} posts.` : 'Loading...'}</CardDescription>
      </CardHeader>
      <CardContent>
          {loading || isMobile === undefined ? (
              <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 md:h-12 w-full" />
                  ))}
              </div>
          ) : posts.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                      <p>No blog posts found.</p>
                      <p className="text-muted-foreground text-sm">Try adding a new post or seeding the initial posts.</p>
                  </TableCell>
              </TableRow>
          ) : (
              isMobile ? renderMobileCards() : renderDesktopTable()
          )}
      </CardContent>
    </Card>
  );
}
