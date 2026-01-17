
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
  id:string;
  type: string;
  name: string;
  stock: number;
  imageUrl: string;
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
  paymentScreenshotUrl?: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Awaiting Confirmation';
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

export type FcmSettings = {
    notificationsEnabled?: boolean;
    tokens?: string[];
}

export type UserProfile = {
    id: string;
    name: string;
    email: string;
    createdAt: any; // Firestore Timestamp
    fcmSettings?: FcmSettings;
};


export type CancellationReason = {
    orderId: string;
    userId: string;
    reasons: string[];
    customReason?: string;
    createdAt: any; // Firestore Timestamp
}

export type BlogPost = {
    id: string;
    slug: string;
    title: string;
    summary: string;
    author: string;
    date: string; // Keep as string for simplicity, can be converted to Timestamp on write
    imageUrl: string;
    imageHint: string;
    content: string; // Markdown content
    createdAt: any; // Firestore Timestamp
};

export type SiteSettings = {
    logoUrl?: string;
};

export type PaymentSettings = {
    qrCodeUrl?: string;
    accountTitle?: string;
    raastId?: string;
};
