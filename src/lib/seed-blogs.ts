
import { Firestore, collection, writeBatch, getDocs, query, doc } from 'firebase/firestore';
import { blogPosts as hardcodedBlogPosts } from './blog-data';

/**
 * Seeds the Firestore 'blog' collection with hardcoded blog posts.
 * This function will only run if the 'blog' collection is empty.
 * @param db The Firestore instance.
 */
export async function seedBlogPosts(db: Firestore) {
  const blogCollection = collection(db, 'blog');
  const q = query(blogCollection);
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    console.log('Blog collection is not empty. Skipping seed.');
    return { success: true, message: 'Blog collection already contains data.' };
  }

  try {
    const batch = writeBatch(db);
    hardcodedBlogPosts.forEach((post) => {
      // Create a new document reference with a random ID in the blog collection
      const docRef = doc(collection(db, 'blog'));
      const postData = { ...post, createdAt: new Date() };
      batch.set(docRef, postData);
    });

    await batch.commit();
    console.log('Successfully seeded blog posts.');
    return { success: true, message: 'Blog posts seeded successfully.' };
  } catch (error) {
    console.error('Error seeding blog posts:', error);
    return { success: false, message: 'Error seeding blog posts.', error };
  }
}
