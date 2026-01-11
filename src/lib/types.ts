

export type ShippingInfo = {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type Variant = {
  id: string;
  name: string;
  stock: number;
  imageUrl?: string;
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
  reviewCount?: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  onSale?: boolean;
  reviews?: any[];
  variants?: Variant[];
  shippingCost?: number;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItemData[];
  totalPrice: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;

  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: any; // Firestore Timestamp
};


export type Category = {
  id: string;
  name: string;
  slug: 'watches' | 'bags' | 'jewelry' | 'sunglasses' | 'wallets' | 'new-arrivals' | 'best-sellers' | 'sale';
};

export type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: any; // Firestore Timestamp
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
  variant?: Variant;
};

export type CartItemData = {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    variant?: {
      id: string;
      name: string;
    }
}

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
