'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNotificationManager } from '@/lib/notifications';
import { Bell } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { SiteSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { toast } = useToast();
  const { getAndSaveToken, requestNotificationPermission } = useNotificationManager();
  const firestore = useFirestore();
  
  const [logoUrl, setLogoUrl] = useState('');

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

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    try {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: 'You need to allow notifications in your browser settings.',
        });
        return;
      }

      const token = await getAndSaveToken();
      if (token) {
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive alerts for new orders on this device.',
        });
      } else {
        throw new Error('Failed to get notification token.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Enabling Notifications',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your admin and site-wide preferences.</p>
      </div>

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
      
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Enable push notifications to get real-time alerts for new orders directly on your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={handleEnableNotifications} disabled={isLoading}>
              <Bell className="mr-2" />
              {isLoading ? 'Enabling...' : 'Enable Order Notifications'}
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-4">
              Note: You may need to do this on each device (e.g., your phone and your computer) where you want to receive notifications.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
