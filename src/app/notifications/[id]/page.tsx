'use client';

import { useParams, notFound } from 'next/navigation';
import { useMemo } from 'react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import type { Notification } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotificationDetailPage() {
    const { id } = useParams();
    const { user } = useUser();
    const firestore = useFirestore();

    const notifRef = useMemo(() => {
        if (!user || !firestore || !id) return null;
        return doc(firestore, 'users', user.uid, 'notifications', id as string);
    }, [user, firestore, id]);

    const { data: notification, loading } = useDoc<Notification>(notifRef);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                 <Skeleton className="h-8 w-32 mb-8" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!notification) {
        notFound();
    }


    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Button asChild variant="ghost" className="mb-8">
                <Link href="/notifications">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to all notifications
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Notification Details</CardTitle>
                    <CardDescription>
                        {notification.createdAt ? format(notification.createdAt.toDate(), 'PPP, p') : 'Just now'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-base select-text">{notification.message}</p>
                </CardContent>
            </Card>
        </div>
    );
}
