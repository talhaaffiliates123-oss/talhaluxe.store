'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNotificationManager } from '@/lib/notifications';
import { Bell, BellOff } from 'lucide-react';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { getAndSaveToken, requestNotificationPermission } = useNotificationManager();

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your admin preferences.</p>
      </div>

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
