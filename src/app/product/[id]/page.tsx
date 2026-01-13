

'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Heart, Minus, Plus, Star, Truck } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useFirestore, useUser } from '@/firebase';
import { getProduct } from '@/lib/products';
import { Product, Review, Variant } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getReviews, submitReview } from '@/lib/reviews';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const ReviewForm = ({ productId, onReviewSubmitted }: { productId: string, onReviewSubmitted: () => void }) => {
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRating(0);
    setComment('');
    setHoverRating(0);
  }, [productId]);


  if (!user || !firestore) {
    return (
        <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You must be logged in to write a review.</p>
                <Button asChild variant="link" className="mt-2">
                    <Link href={`/login?redirect=/product/${productId}`}>Log in or Sign up</Link>
                </Button>
            </CardContent>
        </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    if (rating === 0) {
      toast({ variant: 'destructive', title: 'Rating Required', description: 'Please select a star rating before submitting.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await submitReview(firestore, productId, {
        rating,
        comment,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
      });
      toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });
      setRating(0);
      setComment('');
      onReviewSubmitted();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: error.message || 'Could not submit your review.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Your Rating*</Label>
            <div className="flex items-center gap-1 mt-2" onMouseLeave={() => setHoverRating(0)}>
              {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                return (
                  <Star
                    key={i}
                    className={cn('w-8 h-8 cursor-pointer', 
                      starValue <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    )}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                  />
                );
              })}
            </div>
          </div>
          <div>
            <Label htmlFor="comment">Your Review (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you thought..."
              rows={4}
            />
          </div>
          <Button type="submit" disabled={isSubmitting || rating === 0 || !firestore}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const ReviewList = ({ reviews }: { reviews: Review[] }) => {
  if (reviews.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">Be the first to review this product!</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="flex gap-4">
          <Avatar>
            <AvatarImage src={`https://picsum.photos/seed/${review.userId}/40/40`} alt={`${review.userName}'s avatar`} />
            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{review.userName}</span>
              <span className="text-xs text-muted-foreground">
                {review.createdAt && typeof review.createdAt.toDate === 'function' 
                  ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) 
                  : 'Just now'}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn('w-4 h-4', i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
              ))}
            </div>
            {review.comment && <p className="text-muted-foreground mt-2 text-sm">{review.comment}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}


export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!firestore || !id) return;
    
    setLoading(true);
    try {
      const productId = id as string;
      const productData = await getProduct(firestore, productId);
      
      if (productData) {
        const reviewsData = await getReviews(firestore, productId);
        setProduct(productData);
        setReviews(reviewsData);
        if (productData.variants && productData.variants.length === 1) {
          setSelectedVariant(productData.variants[0]);
        } else {
          setSelectedVariant(null);
        }
      } else {
        setProduct(null);
        setReviews([]);
      }
    } catch (error) {
        console.error("Error fetching product data:", error);
        setProduct(null);
    } finally {
        setLoading(false);
    }
  }, [firestore, id]);
  
  useEffect(() => {
    if (firestore) {
        fetchAllData();
    }
  }, [firestore, fetchAllData]);

  const imageUrls = useMemo(() => {
    if (product?.imageUrls && product.imageUrls.length > 0) {
      return product.imageUrls;
    }
    if (product?.variants && product.variants.length > 0) {
      const variantImages = product.variants.map(v => v.imageUrl).filter(Boolean) as string[];
      if (variantImages.length > 0) {
        return variantImages;
      }
    }
    return ['https://placehold.co/600x600/EEE/31343C?text=No+Image'];
  }, [product]);

  // Autoplay image slider effect
  useEffect(() => {
    if (imageUrls && imageUrls.length > 1) {
      const timer = setInterval(() => {
          setActiveImageIndex((prevIndex) => (prevIndex + 1) % (imageUrls.length || 1));
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [imageUrls]);

  
  const handleVariantChange = (variantId: string) => {
    const variant = product?.variants?.find(v => v.id === variantId);
    if (variant) {
        setSelectedVariant(variant);
        const imageIndex = imageUrls.findIndex(url => url === variant.imageUrl);
        if (imageIndex !== -1) {
            setActiveImageIndex(imageIndex);
        }
    }
  };


  if (loading || !firestore) {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                <div>
                    <Skeleton className="aspect-square w-full rounded-lg"/>
                     <div className="mt-4 grid grid-cols-5 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square w-full rounded-md" />
                        ))}
                    </div>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-8 w-1/4" />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="h-12 w-full sm:w-32" />
                        <Skeleton className="h-12 flex-1" />
                    </div>
                </div>
            </div>
        </div>
    );
  }

  if (!product && !loading) {
      return notFound();
  }
  
  const hasVariants = product.variants && product.variants.length > 0;
  
  // A product can be purchased if it has no variants, OR if it has variants and one has been selected.
  const isReadyToPurchase = !hasVariants || !!selectedVariant;

  const currentStock = useMemo(() => {
    if (!product) return 0;
    if (selectedVariant) return selectedVariant.stock;
    if (hasVariants) return product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
    return product.stock ?? 0;
  }, [product, hasVariants, selectedVariant]);
  

  const handleAddToCart = () => {
    if (!product) return;
    if (hasVariants && !selectedVariant) {
        toast({ variant: 'destructive', title: 'Please select an option' });
        return;
    }
    addItem(product, quantity, selectedVariant || undefined);
    toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (hasVariants && !selectedVariant) {
        toast({ variant: 'destructive', title: 'Please select an option' });
        return;
    }
    addItem(product, quantity, selectedVariant || undefined);
    router.push('/checkout');
  };
  
  const averageRating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
           <div className="aspect-square relative w-full overflow-hidden rounded-lg border">
              {imageUrls.length > 0 ? (
                <Image 
                  src={imageUrls[activeImageIndex]} 
                  alt={product.name}
                  fill 
                  className="object-cover transition-opacity duration-500"
                  key={activeImageIndex}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted">
                    <p className="text-muted-foreground">No Image Available</p>
                </div>
              )}
            </div>
            {imageUrls.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-4">
                    {imageUrls.map((url, index) => (
                        <button 
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={cn(
                                "aspect-square relative w-full overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                activeImageIndex === index ? "ring-2 ring-primary ring-offset-2" : "opacity-75 hover:opacity-100"
                            )}
                        >
                            <Image src={url} alt={`Thumbnail for ${product.name} ${index + 1}`} fill className="object-cover" sizes="10vw" />
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight font-headline">{product.name}</h1>
            <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                </div>
                <span className="text-sm text-muted-foreground">{averageRating.toFixed(1)} ({reviewCount} reviews)</span>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground">{product.shortDescription}</p>
          
          <div className="flex items-baseline gap-2">
            {product.discountedPrice ? (
              <>
                <span className="text-3xl font-bold">PKR {product.discountedPrice}</span>
                <span className="text-xl text-muted-foreground line-through">PKR {product.price}</span>
                <span className="ml-2 inline-block bg-destructive text-destructive-foreground text-sm font-medium px-2 py-1 rounded-md">SALE</span>
              </>
            ) : (
              <span className="text-3xl font-bold">PKR {product.price}</span>
            )}
          </div>

          <Separator />

          {hasVariants && (
            <div className="space-y-4">
              <Label>Options</Label>
              <RadioGroup
                value={selectedVariant?.id}
                onValueChange={handleVariantChange}
                className="flex flex-wrap gap-2"
              >
                {product.variants?.map(variant => (
                  <Label key={variant.id} htmlFor={variant.id} className={cn("flex items-center justify-center rounded-md border-2 p-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer", { 'border-primary bg-accent text-accent-foreground': selectedVariant?.id === variant.id, 'opacity-50 cursor-not-allowed': variant.stock === 0 })}>
                    <RadioGroupItem value={variant.id} id={variant.id} className="sr-only" disabled={variant.stock === 0} />
                    {variant.name}
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}
          
          <div className="space-y-4">
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">{currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleBuyNow} disabled={currentStock === 0}>
              Buy Now
            </Button>
            <Button size="lg" variant="secondary" className="flex-1" onClick={handleAddToCart} disabled={currentStock === 0}>
              Add to Cart
            </Button>
             <Button size="lg" variant="outline" className="px-4">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="mt-16 md:mt-24">
        <Separator />
        <div className="grid md:grid-cols-2 gap-12 mt-12">
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-6">Customer Reviews</h2>
                <ReviewList reviews={reviews} />
            </div>
             <div>
                <ReviewForm productId={product.id} onReviewSubmitted={fetchAllData} />
            </div>
        </div>
      </div>
    </div>
  );
}
