
export type Product = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: Category['slug'];
  imageUrls: string[];
  stock: number;
  rating: number;
  reviews: Review[];
  isNewArrival: boolean;
  isBestSeller: boolean;
  onSale?: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: 'watches' | 'bags' | 'jewelry' | 'sunglasses' | 'new-arrivals' | 'best-sellers' | 'sale';
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  quote: string;
  avatarId: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
