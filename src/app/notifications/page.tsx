'use client';

import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Notification } from '@/lib/types';
import { collection, orderBy, query, writeBatch, doc } from 'firebase/firestore';
import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function NotificationsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const notificationsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(
          collection(firestore, 'users', user.uid, 'notifications'),
          orderBy('createdAt', 'desc')
        );
      }, [user, firestore]);
    
      const { data: notifications, loading } = useCollection<Notification>(notificationsQuery);

      const unreadCount = useMemo(() => {
        return notifications?.filter((n) => !n.read).length ?? 0;
      }, [notifications]);

      // Mark all notifications as read when the page is viewed
      useEffect(() => {
        if (!firestore || !user || !notifications || unreadCount === 0) {
            return;
        }

        const markAsRead = async () => {
            const batch = writeBatch(firestore);
            notifications.forEach((notification) => {
              if (!notification.read) {
                const notifRef = doc(
                  firestore,
                  'users',
                  user.uid,
                  'notifications',
                  notification.id
                );
                batch.update(notifRef, { read: true });
              }
            });
            await batch.commit().catch(console.error);
        };

        // Defer this to avoid a rapid state change on load
        const timeoutId = setTimeout(markAsRead, 1000);
        return () => clearTimeout(timeoutId);

      }, [firestore, user, notifications, unreadCount]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Notifications</h1>
        <p className="mt-2 text-lg text-muted-foreground">Stay up to date with your orders and account activity.</p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>
                {loading ? 'Loading your notifications...' : `You have ${notifications?.length ?? 0} total notifications.`}
            </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
        {loading ? (
            <div className="space-y-4 p-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : notifications && notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((n, index) => (
                <div key={n.id}>
                  <Link
                    href={n.link || '#'}
                    className="block p-4 hover:bg-muted"
                  >
                    <div className="flex items-start gap-4">
                        <div className={`mt-1 h-2.5 w-2.5 rounded-full ${!n.read ? 'bg-accent' : 'bg-transparent'}`} aria-hidden="true" />
                        <div className="flex-1">
                            <p className={`text-sm ${
                                n.read ? 'text-muted-foreground' : 'font-medium text-foreground'
                            }`}>
                                {n.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {n.createdAt
                                ? formatDistanceToNow(n.createdAt.toDate(), {
                                    addSuffix: true,
                                    })
                                : ''}
                            </p>
                        </div>
                         {!n.read && <Badge variant="secondary">New</Badge>}
                    </div>
                  </Link>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <CheckCheck className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">You're all caught up!</h3>
              <p className="text-sm">We'll notify you here about any new updates.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
