

export type ShippingInfo = {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type Product = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  discountedPrice?: number | null;
  category: Category['slug'];
  imageUrls: string[];
  stock: number;
  rating: number;
  reviews: Review[];
  isNewArrival: boolean;
  isBestSeller: boolean;
  onSale?: boolean;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: any; // Firestore Timestamp
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
  id:string;
  name: string;
  location: string;
  quote: string;
  avatarId: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Notification = {
    id: string;
    userId: string;
    message: string;
    read: boolean;
    createdAt: any; // Firestore Timestamp
    link?: string;
}

export type CancellationReason = {
    orderId: string;
    userId: string;
    reasons: string[];
    customReason?: string;
    createdAt: any; // Firestore Timestamp
}
