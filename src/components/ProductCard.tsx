
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Product, Variant } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.imageUrls?.[0] || 'https://placehold.co/600x400/EEE/31343C?text=No+Image';
  
  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-card">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative w-full h-48 mb-4">
            <Image 
                src={imageUrl} 
                alt={product.name} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover rounded-lg"
            />
        </div>
        <h3 className="font-bold text-lg text-card-foreground leading-tight">{product.name}</h3>
        <p className="text-primary font-bold mt-2 text-xl">PKR {product.price}</p>
        
        {product.variants && product.variants.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {(product.variants as Variant[]).map((v, index) => (
              <span key={v.id || index} className="text-xs bg-muted px-2 py-1 rounded-md border text-muted-foreground">
                {v.name}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic">"{product.shortDescription || product.description}"</p> 
      </Link>
      <Button asChild className="w-full mt-4">
        <Link href={`/product/${product.id}`}>View Details</Link>
      </Button>
    </div>
  );
}
