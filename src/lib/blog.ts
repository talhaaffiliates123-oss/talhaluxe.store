'use client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  Firestore,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import type { BlogPost } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function getBlogCollection(db: Firestore) {
  return collection(db, 'blog');
}

export async function getBlogPosts(db: Firestore): Promise<BlogPost[]> {
  const blogCollection = getBlogCollection(db);
  const q = query(blogCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as BlogPost)
  );
}

export async function getBlogPostBySlug(
  db: Firestore,
  slug: string
): Promise<BlogPost | null> {
  const blogCollection = getBlogCollection(db);
  const q = query(blogCollection, where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  return { ...doc.data(), id: doc.id } as BlogPost;
}

export async function getBlogPost(
    db: Firestore,
    id: string
): Promise<BlogPost | null> {
    const docRef = doc(db, 'blog', id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { ...snapshot.data(), id: snapshot.id } as BlogPost;
    }
    return null;
  }

export function addBlogPost(db: Firestore, blogData: Omit<BlogPost, 'id' | 'createdAt'>) {
    const blogCollection = getBlogCollection(db);
    const finalData = { ...blogData, createdAt: serverTimestamp() };
    return addDoc(blogCollection, finalData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: blogCollection.path,
          operation: 'create',
          requestResourceData: finalData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}

export async function updateBlogPost(db: Firestore, id: string, blogData: Partial<Omit<BlogPost, 'id' | 'createdAt'>>) {
    const docRef = doc(db, 'blog', id);
    return updateDoc(docRef, blogData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: blogData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}


export async function deleteBlogPost(db: Firestore, id: string) {
    const docRef = doc(db, 'blog', id);
    return deleteDoc(docRef)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}
