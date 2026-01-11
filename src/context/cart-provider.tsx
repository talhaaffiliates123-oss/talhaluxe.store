'use client';

import type { Product, Variant, CartItem as CartItemType } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface CartContextType {
  items: CartItemType[];
  addItem: (product: Product, quantity?: number, variant?: Variant) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalPrice: number;
  shippingTotal: number;
  totalItems: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItemType[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity = 1, variant?: Variant) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id && item.variant?.id === variant?.id
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id && item.variant?.id === variant?.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity, variant }];
    });
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.variant?.id === variantId)
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.product.id === productId && item.variant?.id === variantId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce(
    (total, item) => total + (item.product.discountedPrice ?? item.product.price) * item.quantity,
    0
  );
  
  const shippingTotal = items.reduce((total, item) => {
    // Basic implementation: add shipping cost for each unique product.
    // To avoid charging shipping per quantity, we find if this product is already added.
    const isProductAlreadyCounted = items.slice(0, items.indexOf(item)).some(i => i.product.id === item.product.id);
    if (!isProductAlreadyCounted) {
      return total + (item.product.shippingCost ?? 0);
    }
    return total;
  }, 0);

  const totalPrice = subtotal + shippingTotal;
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalPrice, shippingTotal, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
};
