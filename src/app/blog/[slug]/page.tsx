
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getFirestore } from 'firebase-admin/firestore';
import type { BlogPost } from '@/lib/types';
import { getBlogPostBySlug } from '@/lib/blog';
import { initializeFirebase } from '@/firebase/server-initialization';

// Initialize Firebase Admin SDK for server-side fetching
const { firestore } = initializeFirebase();

async function getPost(slug: string): Promise<BlogPost | null> {
    if (!firestore) return null;
    // We need a server-side compatible getBlogPostBySlug. Let's assume lib/blog can be adapted or use a direct query.
    // For now, I will use getBlogPostBySlug but it must be server-safe.
    // Let's create a server-side version of this fetch.
    const blogCollection = firestore.collection('blog');
    const q = blogCollection.where('slug', '==', slug);
    const snapshot = await q.get();
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    const data = doc.data();
    // Convert Firestore Timestamp to a serializable format if needed
    const postData = {
        ...data,
        id: doc.id,
        date: data.date, // Assuming date is already a string
        createdAt: data.createdAt.toDate().toISOString(), // Example of converting timestamp
    } as BlogPost
    return postData;
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
