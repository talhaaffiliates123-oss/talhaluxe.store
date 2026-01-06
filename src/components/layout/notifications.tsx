'use client';
import { Button } from '../ui/button';
import { Bell } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import {
  collection,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { useMemo } from 'react';
import Link from 'next/link';

export function Notifications() {
  const { user } = useUser();
  const firestore = useFirestore();

  const notificationsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(10) // Limit to check for unread, not for display
    );
  }, [user, firestore]);

  const { data: notifications } = useCollection<Notification>(
    notificationsQuery
  );

  const unreadCount = useMemo(() => {
    return notifications?.filter((n) => !n.read).length ?? 0;
  }, [notifications]);


  return (
      <Button variant="ghost" size="icon" className="relative" aria-label='Notifications' asChild>
        <Link href="/notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                {unreadCount}
                </span>
            )}
        </Link>
      </Button>
  );
}
