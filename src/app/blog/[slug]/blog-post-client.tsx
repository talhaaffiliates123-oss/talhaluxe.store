
'use client';
import Image from 'next/image';
import { Calendar, User, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { BlogPost } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { getBlogPostBySlug } from '@/lib/blog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function BlogPostSkeleton() {
    return (
        <article>
            <header className="relative h-[50vh] w-full bg-muted">
                <div className="relative z-10 flex h-full flex-col items-center justify-end text-center text-white p-8">
                    <Skeleton className="h-12 w-3/4 max-w-4xl" />
                    <div className="mt-4 flex items-center space-x-6">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </div>
            </header>
            <div className="container mx-auto max-w-4xl px-4 py-12">
                <Card>
                    <div className="p-8 space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-5/6" />
                        <Skeleton className="h-6 w-full mt-8" />
                        <Skeleton className="h-6 w-2/3" />
                    </div>
                </Card>
            </div>
        </article>
    )
}

export default function BlogPostClient({ slug }: { slug: string }) {
    const firestore = useFirestore();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!firestore || !slug) return;

        setLoading(true);
        getBlogPostBySlug(firestore, slug)
            .then(postData => {
                if (postData) {
                    setPost(postData);
                } else {
                    setError("Blog post not found.");
                }
            })
            .catch(e => {
                console.error("Failed to fetch blog post:", e);
                setError("Could not load the blog post.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [firestore, slug]);


    if (loading) {
        return <BlogPostSkeleton />;
    }

    if (error || !post) {
        return (
           <div className="container mx-auto px-4 py-16 text-center">
               <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
               <h1 className="mt-4 text-2xl font-bold">{error || 'Post Not Found'}</h1>
               <p className="mt-2 text-muted-foreground">
                   Sorry, we couldn't find the blog post you're looking for.
               </p>
               <Button asChild className="mt-6">
                   <Link href="/blog">Back to Blog</Link>
               </Button>
           </div>
       );
    }

    return (
        <article>
            <header className="relative h-[50vh] w-full">
                <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                    data-ai-hint={post.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative z-10 flex h-full flex-col items-center justify-end text-center text-white p-8">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-headline max-w-4xl">
                        {post.title}
                    </h1>
                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{post.date}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto max-w-4xl px-4 py-12">
                <Card>
                    <div
                        className="prose dark:prose-invert prose-lg max-w-none p-8 text-muted-foreground prose-h3:text-foreground"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </Card>
            </div>
        </article>
    );
}
