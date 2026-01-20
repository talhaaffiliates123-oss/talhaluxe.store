
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import ProductCard from '@/components/products/product-card';
import type { Product, Deal } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import DealCard from '@/components/deals/deal-card';

interface HomePageContentProps {
  products: Product[];
  deals: Deal[];
}

export default function HomePageContent({ products: initialProducts, deals: initialDeals }: HomePageContentProps) {
  const heroImageUrl = "https://picsum.photos/seed/luxurydark/1920/1080";
  
  const products = initialProducts || [];
  const deals = initialDeals || [];
  const loading = !initialProducts || !initialDeals;

  const { newArrivals, bestSellers, saleProducts } = useMemo(() => {
    const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);
    const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
    const saleProducts = products.filter(p => p.onSale).slice(0, 2);
    return { newArrivals, bestSellers, saleProducts };
  }, [products]);

  const featuredDeals = useMemo(() => {
    return deals.slice(0, 2); // Show up to 2 deals
  }, [deals]);


  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full">
          <Image
            src={heroImageUrl}
            alt="Elegant fashion accessories displayed on a dark background."
            fill
            className="object-cover"
            priority
            data-ai-hint="dark luxury"
          />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-headline">
            Elegance in Every Detail
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200">
            Discover our curated collection of premium fashion accessories.
            Uncompromising quality, timeless style.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/shop">Shop Now</Link>
          </Button>
        </div>
      </section>

      {/* Advertisement Section */}
      <section className="container mx-auto px-4">
        <Link href="https://otieu.com/4/10452971" target="_blank" rel="noopener noreferrer" className="block bg-green-100 p-4 rounded-lg text-center hover:bg-green-200/90 transition-colors shadow-lg border border-green-300/50">
            <span className="text-lg font-bold text-black">
                🤫 Secret Flash Sale: Up to 90% Off Unlocked for the Next 10 Minutes Only!
            </span>
        </Link>
      </section>

      {/* New Arrivals Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            New Arrivals
          </h2>
          <Link
            href="/shop?sort=newest"
            className="text-sm font-medium text-accent hover:text-accent/80 flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {loading ? Array.from({length: 4}).map((_,i) => <Skeleton key={i} className='h-96 w-full'/>) : newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

       {/* Deals Section */}
       {deals.length > 0 && (
          <section className="container mx-auto px-4">
            <div className="flex justify-between items-baseline mb-8">
              <h2 className="text-3xl font-bold tracking-tight font-headline">
                Today's Deals
              </h2>
              <Link
                href="/deals"
                className="text-sm font-medium text-accent hover:text-accent/80 flex items-center gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {loading ? Array.from({length: 2}).map((_,i) => <Skeleton key={i} className='h-96 w-full'/>) : featuredDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </section>
      )}

      {/* Limited Time Offer */}
      <section className="bg-muted">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-accent">Limited Time Offer</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline mt-2">
                Special Collection Sale
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                For a limited time, enjoy up to 30% off on our exclusive collections. Don't miss out on these incredible savings.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/shop?category=sale">Shop The Sale</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {loading ? Array.from({length: 2}).map((_,i) => <Skeleton key={i} className='h-96 w-full'/>) : saleProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Our Best Sellers
          </h2>
           <Link
            href="/shop?sort=best-selling"
            className="text-sm font-medium text-accent hover:text-accent/80 flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {loading ? Array.from({length: 4}).map((_,i) => <Skeleton key={i} className='h-96 w-full'/>) : bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      
        {/* Advertisement Section 2 */}
        <section className="container mx-auto px-4">
            <Link href="https://otieu.com/4/10452971" target="_blank" rel="noopener noreferrer" className="block bg-green-100 p-4 rounded-lg text-center hover:bg-green-200/90 transition-colors shadow-lg border border-green-300/50">
                <span className="text-lg font-bold text-black">
                    🤫 Secret Flash Sale: Up to 90% Off Unlocked for the Next 10 Minutes Only!
                </span>
            </Link>
        </section>

      {/* Newsletter Signup */}
      <section className="container mx-auto px-4 text-center">
        <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight font-headline">
                Join Our Newsletter
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
                Stay up to date with the latest arrivals, offers, and style tips.
            </p>
            <form className="mt-6 flex max-w-md mx-auto">
                <div className="relative flex-grow">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="email" placeholder="Enter your email" className="pl-10 h-12" />
                </div>
                <Button type="submit" className="h-12 ml-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    Subscribe
                </Button>
            </form>
        </div>
      </section>
    </div>
  );
}
