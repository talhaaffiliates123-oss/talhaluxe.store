
'use client';
import {
  collection,
  addDoc,
  Firestore,
  serverTimestamp,
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
  
  const notificationData = {
    ...data,
    userId: userId,
    read: false,
    createdAt: serverTimestamp(),
    link: data.link || '/account', // Default to account page
  };

  return addDoc(notifCollection, notificationData).catch(
    async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: notifCollection.path,
        operation: 'create',
        requestResourceData: notificationData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError; // Re-throw to be caught by the calling function
    }
  );
}

    