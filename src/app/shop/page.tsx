
'use client';
import ProductCard from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { categories } from "@/lib/data";
import { Filter, X } from "lucide-react";
import { useFirestore } from "@/firebase";
import { useEffect, useState, useMemo } from "react";
import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const MAX_PRICE = 150000;

export default function ShopPage() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    // Set initial category from URL query parameter
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
     // Set initial sort from URL query parameter
    const sortParam = searchParams.get('sort');
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (firestore) {
      setLoading(true);
      getProducts(firestore).then(prods => {
        setProducts(prods);
        setLoading(false);
      });
    }
  }, [firestore]);

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked ? [...prev, categorySlug] : prev.filter(slug => slug !== categorySlug)
    );
  };
  
  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, MAX_PRICE]);
    setSortBy('newest');
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Price filter
    filtered = filtered.filter(p => {
        const price = p.discountedPrice ?? p.price;
        return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sorting
    switch (sortBy) {
        case 'price-asc':
            filtered.sort((a, b) => (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price));
            break;
        case 'price-desc':
            filtered.sort((a, b) => (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price));
            break;
        case 'newest':
            filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
            break;
        case 'best-selling':
            filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
            break;
        default:
            break;
    }

    return filtered;
  }, [products, selectedCategories, priceRange, sortBy]);
  
  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] !== 0 || priceRange[1] !== MAX_PRICE;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Shop Our Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">Find your next favorite piece from our curated selection.</p>
      </div>

      <div className="my-8">
        <Link href="https://otieu.com/4/10452971" target="_blank" rel="noopener noreferrer" className="block bg-green-100 p-4 rounded-lg text-center hover:bg-green-200/90 transition-colors shadow-lg border border-green-300/50">
            <span className="text-lg font-bold text-black">
                🤫 Secret Flash Sale: Up to 90% Off Unlocked for the Next 10 Minutes Only!
            </span>
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                </h2>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
                        <X className="w-4 h-4 mr-1"/>
                        Clear
                    </Button>
                )}
              </div>
              
              {/* Category Filter */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="font-medium">Category</h3>
                {categories.filter(c => !['new-arrivals', 'best-sellers', 'sale'].includes(c.slug)).map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox 
                        id={category.slug} 
                        checked={selectedCategories.includes(category.slug)}
                        onCheckedChange={(checked) => handleCategoryChange(category.slug, !!checked)}
                    />
                    <Label htmlFor={category.slug} className="font-normal">{category.name}</Label>
                  </div>
                ))}
              </div>

              {/* Price Range Filter */}
              <div className="space-y-4 pt-6">
                <h3 className="font-medium">Price Range</h3>
                <Slider 
                    value={priceRange} 
                    onValueChange={(value) => setPriceRange(value as [number, number])} 
                    max={MAX_PRICE} 
                    step={1000}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>PKR {priceRange[0]}</span>
                    <span>PKR {priceRange[1]}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Products Grid */}
        <main className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `${filteredAndSortedProducts.length} products found`}
            </p>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-by">Sort by:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="best-selling">Best Selling</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))
            ) : filteredAndSortedProducts.length > 0 ? (
                filteredAndSortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))
            ) : (
                <div className="sm:col-span-2 lg:col-span-3 text-center py-16">
                    <p className="text-lg font-medium">No products match your filters.</p>
                    <p className="text-muted-foreground">Try adjusting your search.</p>
                </div>
            )}
          </div>
            <div className="my-8">
                <Link href="https://otieu.com/4/10452971" target="_blank" rel="noopener noreferrer" className="block bg-green-100 p-4 rounded-lg text-center hover:bg-green-200/90 transition-colors shadow-lg border border-green-300/50">
                    <span className="text-lg font-bold text-black">
                        🤫 Secret Flash Sale: Up to 90% Off Unlocked for the Next 10 Minutes Only!
                    </span>
                </Link>
            </div>
        </main>
      </div>
    </div>
  );
}
