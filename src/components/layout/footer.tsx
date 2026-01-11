import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Twitter, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
               <span className="font-bold text-xl font-headline">Talha Luxe</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium fashion for the discerning individual.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-accent">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent">
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop?category=watches" className="text-muted-foreground hover:text-foreground">Watches</Link></li>
              <li><Link href="/shop?category=bags" className="text-muted-foreground hover:text-foreground">Bags</Link></li>
              <li><Link href="/shop?category=jewelry" className="text-muted-foreground hover:text-foreground">Jewelry</Link></li>
              <li><Link href="/shop?category=sunglasses" className="text-muted-foreground hover:text-foreground">Sunglasses</Link></li>
              <li><Link href="/shop?category=wallets" className="text-muted-foreground hover:text-foreground">Wallets</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              <li><Link href="/shipping-policy" className="text-muted-foreground hover:text-foreground">Shipping Policy</Link></li>
              <li><Link href="/refund-policy" className="text-muted-foreground hover:text-foreground">Return & Refund Policy</Link></li>
              <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="text-muted-foreground hover:text-foreground">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Subscribe for the latest arrivals and offers.</p>
            <form className="flex">
              <Input type="email" placeholder="Your email" className="rounded-r-none" />
              <Button type="submit" className="rounded-l-none bg-primary hover:bg-primary/90">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Talha Luxe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
