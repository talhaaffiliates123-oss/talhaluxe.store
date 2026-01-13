'use client';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { useFirebaseApp, useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export function useNotificationManager() {
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const { user } = useUser();

  const getAndSaveToken = async (): Promise<string | null> => {
    if (!app || !firestore || !user) {
      console.error('Firebase services not ready for notifications.');
      return null;
    }

    const supported = await isSupported();
    if (!supported) {
      console.log('Firebase Messaging is not supported in this browser.');
      return null;
    }

    const messaging = getMessaging(app);
    
    // You need to provide a VAPID key for web push notifications.
    // This key is generated in the Firebase Console under Project Settings > Cloud Messaging > Web configuration.
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
        console.error("VAPID key for Firebase Messaging is missing. Please add NEXT_PUBLIC_FIREBASE_VAPID_KEY to your environment variables.");
        return null;
    }

    try {
      const currentToken = await getToken(messaging, { vapidKey });

      if (currentToken) {
        // Save the token to Firestore
        const tokenRef = doc(firestore, 'fcmTokens', user.uid);
        await setDoc(tokenRef, { token: currentToken, uid: user.uid }, { merge: true });
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
      return null;
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  return { getAndSaveToken, requestNotificationPermission };
}
