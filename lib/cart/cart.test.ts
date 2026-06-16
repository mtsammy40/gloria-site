import { describe, it, expect } from 'vitest';
import {
  addItem,
  removeItem,
  setQuantity,
  subtotalKes,
  totalItems,
  type Cart,
  type CartItem,
} from './cart';

const base: Omit<CartItem, 'quantity'> = {
  productId: 'p1',
  title: 'Forest Light',
  imageUrl: null,
  medium: 'Acrylic',
  dimensions: '60×80cm',
  priceKes: 120000,
  type: 'original',
  stockRemaining: 1,
};

const print: Omit<CartItem, 'quantity'> = {
  productId: 'p2',
  title: 'Tide',
  imageUrl: null,
  medium: 'Oil',
  dimensions: '50×70cm',
  priceKes: 15000,
  type: 'print',
  stockRemaining: 10,
};

const empty: Cart = [];

describe('addItem', () => {
  it('adds a new item with quantity 1', () => {
    const cart = addItem(empty, base);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
  });

  it('caps an original at quantity 1 when added again', () => {
    let cart = addItem(empty, base);
    cart = addItem(cart, base);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
  });

  it('increments a print quantity up to stockRemaining', () => {
    let cart = addItem(empty, print);
    cart = addItem(cart, print);
    expect(cart[0].quantity).toBe(2);
  });

  it('does not exceed stockRemaining for a print', () => {
    let cart: Cart = [{ ...print, quantity: 10 }];
    cart = addItem(cart, print);
    expect(cart[0].quantity).toBe(10);
  });

  it('ignores items with zero stock', () => {
    const soldOut = { ...print, stockRemaining: 0 };
    const cart = addItem(empty, soldOut);
    expect(cart).toHaveLength(0);
  });

  it('adds multiple distinct products', () => {
    let cart = addItem(empty, base);
    cart = addItem(cart, print);
    expect(cart).toHaveLength(2);
  });
});

describe('removeItem', () => {
  it('removes an item by productId', () => {
    const cart = addItem(empty, base);
    const after = removeItem(cart, 'p1');
    expect(after).toHaveLength(0);
  });

  it('is a no-op for unknown productId', () => {
    const cart = addItem(empty, base);
    const after = removeItem(cart, 'unknown');
    expect(after).toHaveLength(1);
  });
});

describe('setQuantity', () => {
  it('updates the quantity of an item', () => {
    let cart: Cart = [{ ...print, quantity: 1 }];
    cart = setQuantity(cart, 'p2', 5);
    expect(cart[0].quantity).toBe(5);
  });

  it('clamps quantity to stockRemaining', () => {
    let cart: Cart = [{ ...print, quantity: 1 }];
    cart = setQuantity(cart, 'p2', 99);
    expect(cart[0].quantity).toBe(10);
  });

  it('removes the item when quantity set to 0', () => {
    let cart: Cart = [{ ...print, quantity: 3 }];
    cart = setQuantity(cart, 'p2', 0);
    expect(cart).toHaveLength(0);
  });

  it('is a no-op for unknown productId', () => {
    const cart: Cart = [{ ...print, quantity: 1 }];
    const after = setQuantity(cart, 'unknown', 5);
    expect(after).toHaveLength(1);
    expect(after[0].quantity).toBe(1);
  });

  it('clamps to max 1 for originals', () => {
    let cart: Cart = [{ ...base, quantity: 1 }];
    cart = setQuantity(cart, 'p1', 5);
    expect(cart[0].quantity).toBe(1);
  });
});

describe('subtotalKes', () => {
  it('returns 0 for empty cart', () => {
    expect(subtotalKes(empty)).toBe(0);
  });

  it('sums price × quantity across items', () => {
    const cart: Cart = [
      { ...base, quantity: 1 },
      { ...print, quantity: 3 },
    ];
    expect(subtotalKes(cart)).toBe(120000 + 15000 * 3);
  });
});

describe('totalItems', () => {
  it('returns the sum of all quantities', () => {
    const cart: Cart = [
      { ...base, quantity: 1 },
      { ...print, quantity: 3 },
    ];
    expect(totalItems(cart)).toBe(4);
  });
});
