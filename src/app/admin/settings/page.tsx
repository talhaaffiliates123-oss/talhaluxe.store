
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { SiteSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useNotificationManager } from '@/hooks/use-notification-manager';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import { Info } from 'lucide-react';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [logoUrl, setLogoUrl] = useState('');


  // Hook for managing notification state and permissions
  const {
    isSupported,
    permission,
    notificationsEnabled,
    toggleNotifications,
    isLoading: notificationsLoading,
  } = useNotificationManager();

  useEffect(() => {
    if (firestore) {
      const settingsRef = doc(firestore, 'settings', 'site');
      getDoc(settingsRef).then(docSnap => {
        if (docSnap.exists()) {
          const settings = docSnap.data() as SiteSettings;
          setLogoUrl(settings.logoUrl || '');
        }
      }).finally(() => setLoadingSettings(false));
    }
  }, [firestore]);
  
  const handleSaveSiteSettings = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'site');
        await setDoc(settingsRef, { logoUrl }, { merge: true });
        toast({
            title: 'Settings Saved',
            description: 'Your site settings have been updated.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Saving Settings',
            description: error.message || 'An unknown error occurred.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  const NotificationStatusDescription = () => {
    if (!isSupported) {
      return "Your browser does not support push notifications.";
    }
    switch (permission) {
      case 'granted':
        return notificationsEnabled ? 'You will receive notifications for new orders.' : 'You have paused notifications.';
      case 'denied':
        return 'You have blocked notifications. To enable them, please update your browser settings for this site.';
      case 'default':
        return 'Enable to receive notifications for new orders.';
      default:
        return 'Checking notification status...';
    }
  };

  const renderNotificationControl = () => {
    if (permission === 'denied') {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="secondary">
              <Info className="mr-2 h-4 w-4" />
              Re-enable Notifications
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>How to Enable Notifications</AlertDialogTitle>
              <AlertDialogDescription>
                You have previously blocked notifications for this site. To receive them, you must manually change the permission in your browser settings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="text-sm space-y-4">
              <p>
                <strong>1. </strong> Go to your browser's site settings. A quick way is to click the padlock icon 🔒 in the address bar.
              </p>
              <p>
                <strong>2. </strong> Find the "Notifications" permission.
              </p>
              <p>
                <strong>3. </strong> Change the setting from "Block" to "Allow" or "Ask".
              </p>
              <p>
                <strong>4. </strong> Reload this page and try enabling notifications again.
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction>Got it</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return (
      <Switch
        checked={notificationsEnabled}
        onCheckedChange={toggleNotifications}
        disabled={!isSupported || notificationsLoading}
        aria-label="Enable order notifications"
      />
    );
  };


  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your admin and site-wide preferences.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure push notifications for important store events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Enable Order Notifications
                </p>
                <p className="text-sm text-muted-foreground">
                  <NotificationStatusDescription />
                </p>
              </div>
              {renderNotificationControl()}
            </div>
            {notificationsLoading && <p className="text-sm text-muted-foreground">Processing...</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>
            Manage general settings for your website, like the logo.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {loadingSettings ? (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <div className="space-y-4 max-w-lg">
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">Website Logo URL</Label>
                        <Input 
                            id="logoUrl"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="text-xs text-muted-foreground">
                            Paste the full URL of your hosted logo image here.
                        </p>
                    </div>
                    <Button onClick={handleSaveSiteSettings} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
