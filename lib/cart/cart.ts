// Pure, framework-independent cart logic. No React, no Next.js imports.

export type CartItemType = 'original' | 'print';

export type CartItem = {
  productId: string;
  title: string;
  imageUrl: string | null;
  medium: string;
  dimensions: string | null;
  priceKes: number;
  type: CartItemType;
  stockRemaining: number;
  quantity: number;
};

export type Cart = CartItem[];

function maxQty(item: Pick<CartItem, 'type' | 'stockRemaining'>): number {
  return item.type === 'original' ? 1 : item.stockRemaining;
}

export function addItem(cart: Cart, incoming: Omit<CartItem, 'quantity'>): Cart {
  const max = maxQty(incoming);
  if (max <= 0) return cart;

  const existing = cart.find((i) => i.productId === incoming.productId);
  if (existing) {
    const next = Math.min(existing.quantity + 1, max);
    if (next === existing.quantity) return cart;
    return cart.map((i) => (i.productId === incoming.productId ? { ...i, quantity: next } : i));
  }

  return [...cart, { ...incoming, quantity: 1 }];
}

export function removeItem(cart: Cart, productId: string): Cart {
  return cart.filter((i) => i.productId !== productId);
}

export function setQuantity(cart: Cart, productId: string, quantity: number): Cart {
  const item = cart.find((i) => i.productId === productId);
  if (!item) return cart;

  const clamped = Math.max(0, Math.min(quantity, maxQty(item)));
  if (clamped === 0) return removeItem(cart, productId);
  if (clamped === item.quantity) return cart;
  return cart.map((i) => (i.productId === productId ? { ...i, quantity: clamped } : i));
}

export function subtotalKes(cart: Cart): number {
  return cart.reduce((sum, i) => sum + i.priceKes * i.quantity, 0);
}

export function totalItems(cart: Cart): number {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}
