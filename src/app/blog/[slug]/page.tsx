
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { BlogPost } from '@/lib/types';
import { initializeFirebase } from '@/firebase/server-initialization';

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const { firestore } = initializeFirebase();
    const blogCollection = firestore.collection('blog');
    const q = blogCollection.where('slug', '==', slug);
    const snapshot = await q.get();

    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    const data = doc.data();

    // Ensure data conforms to BlogPost and handle Timestamps
    const postData = {
        id: doc.id,
        title: data.title || '',
        slug: data.slug || '',
        summary: data.summary || '',
        author: data.author || '',
        date: data.date || '',
        imageUrl: data.imageUrl || '',
        imageHint: data.imageHint || '',
        content: data.content || '',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    } as BlogPost;
    return postData;
  } catch (error) {
      console.error(`Failed to fetch blog post with slug "${slug}":`, error);
      // Return null or rethrow, depending on desired behavior. Here, we'll treat it as not found.
      return null;
  }
}


export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }

  const post = await getPost(slug);

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
