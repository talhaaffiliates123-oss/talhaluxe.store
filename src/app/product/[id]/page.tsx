'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Heart, Minus, Plus, Star, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useFirestore, useUser } from '@/firebase';
import { getProduct } from '@/lib/products';
import { Product, Review } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getReviews, submitReview } from '@/lib/reviews';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const ReviewForm = ({ productId, onReviewSubmitted }: { productId: string, onReviewSubmitted: () => void }) => {
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || !firestore) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <Button type="submit" disabled={isSubmitting || rating === 0}>
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
            <AvatarImage src={`https://picsum.photos/seed/${review.userId}/40/40`} />
            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{review.userName}</span>
              <span className="text-xs text-muted-foreground">
                {review.createdAt ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) : ''}
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
  const { user } = useUser();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchAllData = async () => {
    if (firestore && id) {
        setLoading(true);
        const productId = id as string;
        try {
            const [productData, reviewsData] = await Promise.all([
                getProduct(firestore, productId),
                getReviews(firestore, productId)
            ]);
            
            if (productData) {
                setProduct(productData);
                setReviews(reviewsData);
            } else {
                notFound();
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
            notFound();
        } finally {
            setLoading(false);
        }
    }
  };
  
  useEffect(() => {
    fetchAllData();
  }, [firestore, id]);

  const imageUrls = product?.imageUrls?.length ? product.imageUrls : ['https://placehold.co/600x600/EEE/31343C?text=No+Image'];

  useEffect(() => {
    if (imageUrls && imageUrls.length > 1) {
      const timer = setInterval(() => {
        setActiveImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
      }, 10000); // Change image every 10 seconds

      return () => clearInterval(timer);
    }
  }, [imageUrls]);


  if (loading || !product) {
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

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/checkout');
  };
  
  const averageRating = product.rating;
  const reviewCount = product.reviewCount || 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
           <div className="aspect-square relative w-full overflow-hidden rounded-lg border">
              <Image 
                src={imageUrls[activeImageIndex]} 
                alt={`${product.name} image ${activeImageIndex + 1}`} 
                fill 
                className="object-cover transition-opacity duration-500"
                key={activeImageIndex}
              />
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
                            <Image src={url} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
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
          
          <div className="space-y-4">
            <p className="text-muted-foreground">{product.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-5 w-5 text-accent"/>
                <span>Free shipping on orders over $50</span>
            </div>
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
            <span className="text-sm text-muted-foreground">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleBuyNow} disabled={product.stock === 0}>
              Buy Now
            </Button>
            <Button size="lg" variant="secondary" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
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
                {user ? (
                    <ReviewForm productId={product.id} onReviewSubmitted={fetchAllData} />
                ) : (
                    <Card className="bg-muted/50">
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">You must be logged in to write a review.</p>
                            <Button asChild variant="link" className="mt-2">
                                <Link href={`/login?redirect=/product/${product.id}`}>Log in or Sign up</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
