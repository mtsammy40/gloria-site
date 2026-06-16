// Pure order logic — no DB imports. Testable with in-memory fixtures.

export type OrderLineInput = {
  productId: string;
  priceKes: number;
  quantity: number;
};

export type OrderTotals = {
  subtotalKes: number;
  shippingFeeKes: number;
  totalKes: number;
};

export function computeOrderTotals(
  lines: OrderLineInput[],
  shippingFeeKes: number,
): OrderTotals {
  const subtotalKes = lines.reduce((sum, l) => sum + l.priceKes * l.quantity, 0);
  return { subtotalKes, shippingFeeKes, totalKes: subtotalKes + shippingFeeKes };
}

export type InventorySnapshot = {
  productId: string;
  stockRemaining: number;
  manuallyMarkedSold: boolean;
};

export type InventoryDecrement = {
  productId: string;
  newStockRemaining: number;
};

export type DecrementResult = {
  decrements: InventoryDecrement[];
  needsReview: boolean;
};

export function decrementInventory(
  lines: OrderLineInput[],
  inventory: InventorySnapshot[],
): DecrementResult {
  const byId = new Map(inventory.map((s) => [s.productId, { ...s }]));
  const decrements: InventoryDecrement[] = [];
  let needsReview = false;

  for (const line of lines) {
    const snap = byId.get(line.productId);
    if (!snap || snap.manuallyMarkedSold || snap.stockRemaining < line.quantity) {
      needsReview = true;
      // Still record a "decrement" of 0 so the caller knows which items had conflicts
      decrements.push({ productId: line.productId, newStockRemaining: snap?.stockRemaining ?? 0 });
    } else {
      const newStockRemaining = snap.stockRemaining - line.quantity;
      decrements.push({ productId: line.productId, newStockRemaining });
      // Update snapshot so later lines in the same order see updated stock
      byId.set(line.productId, { ...snap, stockRemaining: newStockRemaining });
    }
  }

  return { decrements, needsReview };
}
