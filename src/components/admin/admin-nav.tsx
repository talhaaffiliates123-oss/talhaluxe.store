'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Package, Settings } from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/admin/products', label: 'Products', icon: Package },
    // { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    // { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="grid items-start gap-2">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              isActive && 'bg-muted text-primary'
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
