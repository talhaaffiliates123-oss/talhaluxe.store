import ProductCard from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { categories, products } from "@/lib/data";
import { Filter } from "lucide-react";

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Shop Our Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">Find your next favorite piece from our curated selection.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h2>
              
              {/* Category Filter */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="font-medium">Category</h3>
                {categories.filter(c => !['new-arrivals', 'best-sellers'].includes(c.slug)).map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox id={category.slug} />
                    <Label htmlFor={category.slug} className="font-normal">{category.name}</Label>
                  </div>
                ))}
              </div>

              {/* Price Range Filter */}
              <div className="space-y-4 pt-6">
                <h3 className="font-medium">Price Range</h3>
                <Slider defaultValue={[0, 1500]} max={1500} step={50} />
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$0</span>
                    <span>$1500</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Products Grid */}
        <main className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">{products.length} products</p>
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-by">Sort by:</Label>
              <Select defaultValue="newest">
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
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
