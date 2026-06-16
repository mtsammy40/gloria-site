import { describe, it, expect } from 'vitest';
import { computeOrderTotals, decrementInventory } from './engine';

describe('computeOrderTotals', () => {
  it('sums price × quantity for each line', () => {
    const totals = computeOrderTotals(
      [
        { productId: 'p1', priceKes: 120000, quantity: 1 },
        { productId: 'p2', priceKes: 15000, quantity: 3 },
      ],
      500,
    );
    expect(totals.subtotalKes).toBe(120000 + 15000 * 3); // 165000
    expect(totals.shippingFeeKes).toBe(500);
    expect(totals.totalKes).toBe(165500); // subtotal + shipping
  });

  it('handles a single item with no shipping', () => {
    const totals = computeOrderTotals([{ productId: 'p1', priceKes: 50000, quantity: 1 }], 0);
    expect(totals.totalKes).toBe(50000);
  });

  it('applies international shipping', () => {
    const totals = computeOrderTotals([{ productId: 'p1', priceKes: 80000, quantity: 1 }], 3000);
    expect(totals.totalKes).toBe(83000);
  });
});

describe('decrementInventory', () => {
  it('decrements stock by the ordered quantity', () => {
    const result = decrementInventory(
      [{ productId: 'p1', priceKes: 50000, quantity: 1 }],
      [{ productId: 'p1', stockRemaining: 5, manuallyMarkedSold: false }],
    );
    expect(result.needsReview).toBe(false);
    expect(result.decrements[0].newStockRemaining).toBe(4);
  });

  it('reduces an original to 0 on purchase', () => {
    const result = decrementInventory(
      [{ productId: 'orig', priceKes: 120000, quantity: 1 }],
      [{ productId: 'orig', stockRemaining: 1, manuallyMarkedSold: false }],
    );
    expect(result.decrements[0].newStockRemaining).toBe(0);
    expect(result.needsReview).toBe(false);
  });

  it('flags needs_review when stock is insufficient (oversell)', () => {
    const result = decrementInventory(
      [{ productId: 'p1', priceKes: 15000, quantity: 5 }],
      [{ productId: 'p1', stockRemaining: 3, manuallyMarkedSold: false }],
    );
    expect(result.needsReview).toBe(true);
    // No decrement on the conflicting item
    expect(result.decrements[0].newStockRemaining).toBe(3);
  });

  it('flags needs_review when product is manually marked sold', () => {
    const result = decrementInventory(
      [{ productId: 'p1', priceKes: 80000, quantity: 1 }],
      [{ productId: 'p1', stockRemaining: 1, manuallyMarkedSold: true }],
    );
    expect(result.needsReview).toBe(true);
  });

  it('flags needs_review when product is missing from inventory snapshot', () => {
    const result = decrementInventory(
      [{ productId: 'ghost', priceKes: 10000, quantity: 1 }],
      [],
    );
    expect(result.needsReview).toBe(true);
  });

  it('handles multiple lines; later lines see updated stock', () => {
    // Two buyers want the same print; only the first can be satisfied in the same order
    const result = decrementInventory(
      [
        { productId: 'print', priceKes: 15000, quantity: 3 },
        { productId: 'print', priceKes: 15000, quantity: 3 },
      ],
      [{ productId: 'print', stockRemaining: 5, manuallyMarkedSold: false }],
    );
    // First line OK (5 → 2), second line fails (2 < 3)
    expect(result.decrements[0].newStockRemaining).toBe(2);
    expect(result.needsReview).toBe(true);
  });
});
