
'use client';

import Link from 'next/link';
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UserNav } from './user-nav';
import { useCart } from '@/hooks/use-cart';
import { useUser, useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import type { SiteSettings } from '@/lib/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function Header() {
  const { items } = useCart();
  const { user } = useUser();
  const firestore = useFirestore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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


  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/deals', label: 'Deals' },
    { href: '/blog', label: 'Blog' },
    { href: '/shop?category=new-arrivals', label: 'New Arrivals' },
    { href: '/shop?category=sale', label: 'Sale' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const SiteLogo = () => (
    logoUrl ? (
      <Image src={logoUrl} alt="Talha Luxe Logo" width={140} height={40} className="object-contain" priority />
    ) : (
      <span className="font-bold text-lg font-headline">Talha Luxe</span>
    )
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm('');
        setSearchOpen(false); // Close the dialog
    }
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <SiteLogo />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

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
          <SheetContent side="left">
            <SheetHeader>
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium">
              <SheetClose asChild>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <SiteLogo />
                </Link>
              </SheetClose>
              {navLinks.map((link) => (
                <SheetClose asChild key={link.href}>
                    <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground"
                    >
                    {link.label}
                    </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="flex w-full items-center justify-end gap-2 md:ml-auto">
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Search">
                    <Search className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Search Products</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <Input 
                        placeholder="e.g. ChronoGold Watch" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button type="submit">Search</Button>
                </form>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" aria-label="Wishlist" asChild>
             <Link href="/wishlist">
                <Heart className="h-5 w-5" />
             </Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative" aria-label="Cart" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
