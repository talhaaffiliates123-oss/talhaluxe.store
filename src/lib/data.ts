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
export const products: Product[] = [];


export const testimonials: Testimonial[] = [
    {
        id: 'test_1',
        name: 'Jessica L.',
        location: 'New York, USA',
        quote: 'The quality of the watch I bought is exceptional. It looks even more stunning in person. Fast shipping and beautiful packaging!',
        avatarId: 'testimonial-1-avatar'
    },
    {
        id: 'test_2',
        name: 'David R.',
        location: 'London, UK',
        quote: 'I purchased The Executive Bag and it has exceeded all my expectations. It\'s the perfect blend of style and functionality. Highly recommend!',
        avatarId: 'testimonial-2-avatar'
    },
    {
        id: 'test_3',
        name: 'Priya S.',
        location: 'Mumbai, India',
        quote: 'Talha Luxe is my go-to for accessories. The designs are unique and the customer service is top-notch. I always get compliments on my jewelry.',
        avatarId: 'testimonial-3-avatar'
    }
];
