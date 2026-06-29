'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { Menu, Package2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import type { SiteSettings } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
  } from '@/components/ui/sheet';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const firestore = useFirestore();

  const adminEmail = "talhaaffiliates123@gmail.com";

  useEffect(() => {
    if (!firestore) return;

    const settingsRef = doc(firestore, 'settings', 'site');
    getDoc(settingsRef).then(docSnap => {
      if (docSnap.exists()) {
        const settings = docSnap.data() as SiteSettings;
        setLogoUrl(settings.logoUrl || null);
      }
    });
  }, [firestore]);


  useEffect(() => {
    if (!loading) {
      if (user && user.email?.toLowerCase() === adminEmail.toLowerCase()) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        // Only redirect if we are sure they aren't authorized
        const timeout = setTimeout(() => {
            router.push('/');
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [user, loading, router, adminEmail]);

  if (loading || isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-card">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground animate-pulse">Verifying administrative access...</p>
          <Skeleton className="h-2 w-48 bg-muted" />
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 text-center p-8 max-w-md">
                <ShieldAlert className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">
                    You do not have permission to access the admin panel. 
                    If you are the administrator, please ensure you are logged in with <strong>{adminEmail}</strong>.
                </p>
                <p className="text-xs text-muted-foreground mt-4">Redirecting you to the home page...</p>
                <Button asChild variant="outline">
                    <Link href="/">Back to Site</Link>
                </Button>
            </div>
        </div>
    );
  }
  
  const SiteLogo = () => (
    logoUrl ? (
      <Image src={logoUrl} alt="Talha Luxe Logo" width={140} height={40} className="object-contain" priority />
    ) : (
      <>
        <Package2 className="h-6 w-6 text-primary" />
        <span className="font-bold">Admin Panel</span>
      </>
    )
  );

  return (
    <div className="dark bg-background text-foreground">
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-16 lg:px-6">
              <Link href="/admin" className="flex items-center gap-2 font-semibold">
                <SiteLogo />
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <AdminNav />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-16 lg:px-6">
              <Sheet>
                <SheetTrigger asChild>
                    <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                    >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col dark bg-card text-foreground">
                    <nav className="grid gap-2 text-lg font-medium mt-8">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 text-lg font-semibold mb-4"
                    >
                        <SiteLogo />
                    </Link>
                     <AdminNav />
                    </nav>
                </SheetContent>
              </Sheet>

              <div className="w-full flex-1"></div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background/95">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}