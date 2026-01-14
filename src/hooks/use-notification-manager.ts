
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, isSupported as isFcmSupported } from 'firebase/messaging';
import { useFirestore, useMessaging, useUser } from '@/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { useToast } from './use-toast';

// The VAPID key from your Firebase project settings.
// This is public and safe to include in client-side code.
const VAPID_KEY = 'BPPi1UjP6yU2r2hfsO0a_L-d3n1ZgC-olq2_1XVT29wW6f-2JdaYhprr3jEzj7i_p1kP2p5J2Fh_H4x6j4J2Sg0';

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
      setNotificationsEnabled(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userSettingsRef = doc(firestore, 'users', user.uid);
    getDoc(userSettingsRef).then(docSnap => {
      if (docSnap.exists()) {
        const settings = docSnap.data()?.fcmSettings;
        setNotificationsEnabled(settings?.notificationsEnabled ?? false);
      } else {
        setNotificationsEnabled(false);
      }
    }).finally(() => {
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
    
    // Request permission. The browser will show a popup here.
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
    
    // If currently enabled, we are turning them off.
    if (notificationsEnabled) {
        try {
            await updateNotificationPreference(false);
            toast({ title: 'Notifications Disabled', description: 'You will no longer receive order updates.' });
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        } finally {
            setIsLoading(false);
        }
        return;
    }

    // If currently disabled, we are turning them on.
    try {
        // This will trigger the browser permission prompt if not already granted.
        await getAndRegisterToken();

        // If permission was granted, the above function will complete without error.
        // We can now update the preference in Firestore.
        await updateNotificationPreference(true);
        toast({ title: 'Notifications Enabled!', description: 'You will now receive updates for new orders.' });
    
    } catch (error: any) {
        console.error('Error toggling notifications:', error);
        toast({
            variant: 'destructive',
            title: 'Could Not Enable Notifications',
            description: error.message || 'Please try again.',
        });
        // Ensure the visual state remains 'off' if it failed
        setNotificationsEnabled(false);
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
