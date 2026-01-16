
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { getPaymentSettings, savePaymentSettings } from '@/lib/settings';
import type { PaymentSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPaymentPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [raastId, setRaastId] = useState('');

  useEffect(() => {
    if (firestore) {
      getPaymentSettings(firestore).then(settings => {
        if (settings) {
          setQrCodeUrl(settings.qrCodeUrl || '');
          setAccountTitle(settings.accountTitle || '');
          setRaastId(settings.raastId || '');
        }
      }).finally(() => setLoadingSettings(false));
    }
  }, [firestore]);
  
  const handleSavePaymentSettings = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
        const settings: PaymentSettings = { qrCodeUrl, accountTitle, raastId };
        await savePaymentSettings(firestore, settings);
        toast({
            title: 'Settings Saved',
            description: 'Your payment settings have been updated.',
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
        <h1 className="text-3xl font-bold">Payment Settings</h1>
        <p className="text-muted-foreground">Manage QR code and bank transfer details for manual payments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual Payment Details</CardTitle>
          <CardDescription>
            This information will be displayed to customers at checkout if they select the bank transfer/QR option.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {loadingSettings ? (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <div className="space-y-4 max-w-lg">
                    <div className="space-y-2">
                        <Label htmlFor="qrCodeUrl">Payment QR Code URL</Label>
                        <Input 
                            id="qrCodeUrl"
                            value={qrCodeUrl}
                            onChange={(e) => setQrCodeUrl(e.target.value)}
                            placeholder="https://example.com/qr.png"
                        />
                        <p className="text-xs text-muted-foreground">
                            Paste the full URL of your hosted QR code image.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountTitle">Account Title</Label>
                        <Input 
                            id="accountTitle"
                            value={accountTitle}
                            onChange={(e) => setAccountTitle(e.target.value)}
                            placeholder="e.g., Saba Haroon"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="raastId">Raast ID / Account Number</Label>
                        <Input 
                            id="raastId"
                            value={raastId}
                            onChange={(e) => setRaastId(e.target.value)}
                            placeholder="e.g., 03259446562"
                        />
                    </div>
                    <Button onClick={handleSavePaymentSettings} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Payment Settings'}
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
