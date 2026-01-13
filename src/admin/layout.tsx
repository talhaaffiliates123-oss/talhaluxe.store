'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { Package2 } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import type { SiteSettings } from '@/lib/types';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const firestore = useFirestore();

  // Hardcode the admin email to ensure the check works without relying on environment variables.
  const adminEmail = "talhaaffiliates123@gmail.com";

  useEffect(() => {
    if (firestore) {
      const settingsRef = doc(firestore, 'settings', 'site');
      getDoc(settingsRef).then(docSnap => {
        if (docSnap.exists()) {
          const settings = docSnap.data() as SiteSettings;
          setLogoUrl(settings.logoUrl || null);
        }
      });
    }
  }, [firestore]);


  useEffect(() => {
    if (!loading) {
      if (user && user.email === adminEmail) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.replace('/');
      }
      setIsVerifying(false);
    }
  }, [user, loading, router, adminEmail]);

  if (isVerifying) {
    // Show a loading/verification screen while checking.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-400">Verifying access...</p>
          <Skeleton className="h-6 w-32 bg-gray-700" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    // This will be shown briefly before the redirect happens.
    return null;
  }
  
  const SiteLogo = () => (
    logoUrl ? (
      <Image src={logoUrl} alt="Talha Luxe Logo" width={140} height={40} className="object-contain" priority />
    ) : (
      <>
        <Package2 className="h-6 w-6 text-primary" />
        <span>Admin Panel</span>
      </>
    )
  );

  // If authorized, render the admin layout.
  return (
    <div className="dark bg-background text-foreground">
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card lg:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-16 items-center border-b px-6">
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
          <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
              {/* Can add mobile nav toggle and search here later */}
              <h1 className="text-xl font-semibold">Dashboard</h1>
          </header>
          <main className="flex-1 p-6 bg-background/95">{children}</main>
        </div>
      </div>
    </div>
  );
}
