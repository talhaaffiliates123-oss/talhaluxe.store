
'use client';
import type { Deal } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Package } from 'lucide-react';

type DealCardProps = {
  deal: Deal;
};

export default function DealCard({ deal }: DealCardProps) {
  const allImages = deal.products.flatMap(p => p.imageUrls).filter(Boolean);
  const displayImages = allImages.length > 0 ? allImages : ['https://placehold.co/600x600/EEE/31343C?text=Deal'];

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-0">
        <Link href={`/deals/${deal.id}`} className="block">
          <Carousel className="w-full">
            <CarouselContent>
              {displayImages.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-square w-full overflow-hidden relative">
                    <Image
                      src={url}
                      alt={`${deal.name} - Image ${index + 1}`}
                      fill
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {displayImages.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/50 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background" />
                </>
            )}
          </Carousel>
        </Link>
        <div className="p-4">
            <div className="flex items-center justify-between">
                <Badge variant="secondary">Bundle Deal</Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4"/>
                    <span>{deal.products.length} Products</span>
                </div>
            </div>
          <h3 className="mt-2 font-semibold truncate text-lg">
            <Link href={`/deals/${deal.id}`}>{deal.name}</Link>
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 h-10">{deal.description}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-xl font-bold">PKR {deal.dealPrice.toFixed(2)}</p>
          </div>
          <Button
            asChild
            className="w-full mt-4"
          >
            <Link href={`/deals/${deal.id}`}>View Deal</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
