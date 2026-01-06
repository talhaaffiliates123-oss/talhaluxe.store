'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '../ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import {
  collection,
  orderBy,
  query,
  limit,
  writeBatch,
  doc,
} from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { useMemo } from 'react';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '../ui/separator';

export function Notifications() {
  const { user } = useUser();
  const firestore = useFirestore();

  const notificationsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [user, firestore]);

  const { data: notifications } = useCollection<Notification>(
    notificationsQuery
  );

  const unreadCount = useMemo(() => {
    return notifications?.filter((n) => !n.read).length ?? 0;
  }, [notifications]);

  const handleOpenChange = async (open: boolean) => {
    if (open || !firestore || !user || !notifications || unreadCount === 0)
      return;

    // Mark all visible notifications as read
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
    await batch.commit();
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label='Notifications'>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 font-medium border-b">
          <h4>Notifications</h4>
        </div>
        <div className="flex flex-col">
          {notifications && notifications.length > 0 ? (
            notifications.map((n, index) => (
              <div key={n.id}>
                <Link
                  href={n.link || '#'}
                  className="block p-4 hover:bg-muted"
                >
                  <p
                    className={`text-sm ${
                      n.read ? 'text-muted-foreground' : 'font-medium'
                    }`}
                  >
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {n.createdAt
                      ? formatDistanceToNow(n.createdAt.toDate(), {
                          addSuffix: true,
                        })
                      : ''}
                  </p>
                </Link>
                {index < notifications.length - 1 && <Separator />}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <CheckCheck className="h-8 w-8 mx-auto mb-2" />
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
