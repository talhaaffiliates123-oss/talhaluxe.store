

import type { Product, Category, Testimonial } from './types';

export const categories: Category[] = [
  { id: '1', name: 'Watches', slug: 'watches' },
  { id: '2', name: 'Bags', slug: 'bags' },
  { id: '3', name: 'Jewelry', slug: 'jewelry' },
  { id: '4', name: 'Sunglasses', slug: 'sunglasses' },
  { id: '5', name: 'New Arrivals', slug: 'new-arrivals' },
  { id: '6', name: 'Best Sellers', slug: 'best-sellers' },
  { id: '7', name: 'Sale', slug: 'sale' },
];

// Product data is now managed in Firestore.
// This file can be used for other static data like categories or testimonials.
export const products: Omit<Product, 'id'>[] = [
  {
    name: 'ChronoGold Watch',
    shortDescription: 'Elegant gold chronograph.',
    description: 'A masterpiece of timekeeping, this watch combines classic design with modern precision. The gold-plated stainless steel case and sophisticated dial make it a statement piece for any occasion.',
    price: 45000,
    discountedPrice: 39900,
    category: 'watches',
    imageUrls: [],
    stock: 15,
    rating: 4.8,
    reviews: [],
    isNewArrival: true,
    isBestSeller: false,
    onSale: true,
  },
  {
    name: 'Classic Timekeeper',
    shortDescription: 'A timeless silver watch.',
    description: 'Featuring a sleek silver finish and a minimalist black dial, this watch is the epitome of understated elegance. Perfect for both formal events and everyday wear.',
    price: 25000,
    discountedPrice: null,
    category: 'watches',
    imageUrls: [],
    stock: 25,
    rating: 4.6,
    reviews: [],
    isNewArrival: false,
    isBestSeller: true,
    onSale: false,
  },
  {
    name: 'Arabian Black Aura Watch',
    shortDescription: 'A mysterious and alluring timepiece with Arabic numerals.',
    description: 'Embrace the mystique of the desert night with the Arabian Black Aura watch. This stunning timepiece features a matte black finish and a deep black dial adorned with elegant Eastern Arabic numerals. Subtle golden accents recall distant stars, and the comfortable black silicone strap ensures all-day wearability. It\'s a watch that doesn\'t just tell time, but tells a story of heritage and mystery.',
    price: 1300,
    discountedPrice: null,
    category: 'watches',
    imageUrls: [],
    stock: 20,
    rating: 4.7,
    reviews: [],
    isNewArrival: true,
    isBestSeller: false,.