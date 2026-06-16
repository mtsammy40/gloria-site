'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  addItem,
  removeItem,
  setQuantity,
  subtotalKes,
  totalItems,
  type Cart,
  type CartItem,
} from './cart';

const STORAGE_KEY = 'gloria-cart';

type CartContextValue = {
  cart: Cart;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCart(JSON.parse(stored));
    } catch {
      // Corrupted storage — start fresh
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on every cart change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage full or unavailable
    }
  }, [cart, hydrated]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => addItem(prev, item));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => removeItem(prev, productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => setQuantity(prev, productId, quantity));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal: subtotalKes(cart),
        count: totalItems(cart),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
