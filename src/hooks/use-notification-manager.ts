
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, isSupported as isFcmSupported } from 'firebase/messaging';
import { useFirestore, useMessaging, useUser } from '@/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { useToast } from './use-toast';

// The VAPID key from your Firebase project settings.
// This is public and safe to include in client-side code.
const VAPID_KEY = 'YOUR_VAPID_KEY_FROM_FIREBASE_SETTINGS';

/**
 * A custom hook to manage FCM notification permissions, token registration,
 * and user notification settings in Firestore.
 */
export function useNotificationManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const messaging = useMessaging();
  const { toast } = useToast();

  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for FCM support and current permission status on mount.
  useEffect(() => {
    async function checkSupport() {
      const supported = await isFcmSupported();
      setIsSupported(supported);
      if (supported) {
        setPermission(Notification.permission);
      }
      setIsLoading(false);
    }
    checkSupport();
  }, []);

  // Fetch user's notification preference from Firestore.
  useEffect(() => {
    if (!user || !firestore) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userSettingsRef = doc(firestore, 'users', user.uid);
    getDoc(userSettingsRef).then(docSnap => {
      if (docSnap.exists()) {
        const settings = docSnap.data()?.fcmSettings;
        setNotificationsEnabled(settings?.notificationsEnabled ?? false);
      }
      setIsLoading(false);
    });
  }, [user, firestore]);

  /**
   * Requests notification permission from the user and retrieves an FCM token.
   * If successful, it saves the token to the user's document in Firestore.
   */
  const getAndRegisterToken = useCallback(async () => {
    if (!messaging || !user || !firestore) {
      throw new Error('Firebase services not ready.');
    }
    
    // Request permission.
    const currentPermission = await Notification.requestPermission();
    setPermission(currentPermission);
    
    if (currentPermission !== 'granted') {
      throw new Error('Notification permission was not granted.');
    }

    // Get the FCM token.
    const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!fcmToken) {
      throw new Error('Could not retrieve FCM token.');
    }
    
    // Save the token to Firestore.
    const userSettingsRef = doc(firestore, 'users', user.uid);
    await setDoc(userSettingsRef, {
        fcmSettings: {
            tokens: arrayUnion(fcmToken)
        }
    }, { merge: true });

    return fcmToken;
  }, [messaging, user, firestore]);

  /**
   * Updates the user's notification preference in Firestore.
   * @param {boolean} enabled - The new notification preference.
   */
  const updateNotificationPreference = useCallback(async (enabled: boolean) => {
    if (!user || !firestore) {
      throw new Error('User or Firestore not available.');
    }

    const userSettingsRef = doc(firestore, 'users', user.uid);
    await setDoc(userSettingsRef, {
        fcmSettings: {
            notificationsEnabled: enabled
        }
    }, { merge: true });
    
    setNotificationsEnabled(enabled);

  }, [user, firestore]);

  /**
   * Main toggle function to be called by the UI.
   * Handles the entire flow of enabling/disabling notifications.
   */
  const toggleNotifications = async () => {
    setIsLoading(true);
    try {
      if (notificationsEnabled) {
        // If turning off, just update the preference in Firestore.
        await updateNotificationPreference(false);
        toast({ title: 'Notifications Disabled', description: 'You will no longer receive order updates.' });
      } else {
        // If turning on, get a token first, then update preference.
        await getAndRegisterToken();
        await updateNotificationPreference(true);
        toast({ title: 'Notifications Enabled!', description: 'You will now receive updates for new orders.' });
      }
    } catch (error: any) {
      console.error('Error toggling notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Could Not Update Settings',
        description: error.message || 'Please try again.',
      });
      // Revert UI state on failure
      setNotificationsEnabled(prev => !prev);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    notificationsEnabled,
    toggleNotifications,
    isLoading,
  };
}
