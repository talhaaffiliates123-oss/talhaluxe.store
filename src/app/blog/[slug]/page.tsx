import { blogPosts, BlogPost } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);

  if (!post) {
    notFound();
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
