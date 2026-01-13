
'use client';

import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { getBlogPosts } from '@/lib/blog';
import type { BlogPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogListPage() {
  const firestore = useFirestore();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firestore) {
      getBlogPosts(firestore).then(posts => {
        setBlogPosts(posts);
        setLoading(false);
      });
    }
  }, [firestore]);

  return (
    <div className="bg-background">
      <section className="relative h-[40vh] w-full bg-muted">
        <Image
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxibG9nJTIwYmFubmVyfGVufDB8fHx8fDE3MDM1OTEzMTZ8MA&ixlib=rb-4.0.3&q=80&w=1080"
            alt="A stylish desk with a laptop, notebook, and coffee, suggesting a blog or writing theme."
            fill
            className="object-cover"
            priority
            data-ai-hint="blog banner"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
                The Talha Luxe Blog
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200">
                Insights on style, craftsmanship, and the art of luxury.
            </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({length: 6}).map((_, i) => (
                <Card key={i}><CardContent className="p-4 space-y-4"><Skeleton className="aspect-video w-full" /><Skeleton className="h-4 w-1/4" /><Skeleton className="h-6 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
            ))
          ) : blogPosts.length === 0 ? (
            <p className="md:col-span-3 text-center text-muted-foreground">No blog posts found.</p>
          ) : (
            blogPosts.map((post) => (
              <Card key={post.slug} className="group overflow-hidden flex flex-col">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="aspect-video w-full overflow-hidden relative">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>
                <CardContent className="p-6 flex-grow flex flex-col">
                  <div className='flex-grow'>
                      <p className="text-sm text-muted-foreground">{post.date}</p>
                      <h2 className="text-xl font-semibold mt-2 leading-tight">
                          <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                              {post.title}
                          </Link>
                      </h2>
                      <p className="mt-3 text-muted-foreground text-sm line-clamp-3">{post.summary}</p>
                  </div>
                  <div className="mt-4">
                    <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-primary hover:underline flex items-center">
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
