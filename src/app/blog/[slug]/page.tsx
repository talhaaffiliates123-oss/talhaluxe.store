
import { Suspense, use } from 'react';
import BlogPostClient from './blog-post-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

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

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  if (!slug) {
    return null;
  }

  return (
    <Suspense fallback={<BlogPostSkeleton />}>
      <BlogPostClient slug={slug} />
    </Suspense>
  );
}
