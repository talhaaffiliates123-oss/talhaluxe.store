'use client';
import {
  collection,
  addDoc,
  Firestore,
  serverTimestamp,
  doc,
  setDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type NotificationData = {
  message: string;
  link?: string;
};

export function createNotification(
  db: Firestore,
  userId: string,
  data: NotificationData
) {
  const notifCollection = collection(db, 'users', userId, 'notifications');
  
  // Create a reference with a new ID first
  const newNotifRef = doc(notifCollection);

  const notificationData = {
    ...data,
    userId: userId,
    read: false,
    createdAt: serverTimestamp(),
    // Use the pre-generated ID for the link
    link: data.link || `/notifications/${newNotifRef.id}`,
  };

  // Use setDoc with the new reference to ensure the ID matches
  return setDoc(newNotifRef, notificationData).catch(
    async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: newNotifRef.path,
        operation: 'create',
        requestResourceData: notificationData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError; // Re-throw to be caught by the calling function
    }
  );
}
