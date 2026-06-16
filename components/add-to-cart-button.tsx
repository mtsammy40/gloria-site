'use client';

import { useCart } from '@/lib/cart/cart-context';
import type { CartItem } from '@/lib/cart/cart';

type Props = {
  item: Omit<CartItem, 'quantity'>;
};

export function AddToCartButton({ item }: Props) {
  const { addToCart, cart } = useCart();

  const inCart = cart.find((c) => c.productId === item.productId);
  const atMax =
    item.type === 'original'
      ? (inCart?.quantity ?? 0) >= 1
      : (inCart?.quantity ?? 0) >= item.stockRemaining;

  function handleClick() {
    addToCart(item);
  }

  if (atMax && item.type === 'original' && inCart) {
    return (
      <div className="space-y-3">
        <p className="font-sans text-xs uppercase tracking-widest text-sage">In your cart</p>
        <a
          href="/cart"
          className="inline-block font-sans text-xs uppercase tracking-widest border border-obsidian text-obsidian px-10 py-4 hover:bg-obsidian hover:text-ivory transition-colors"
        >
          View Cart →
        </a>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={atMax}
      className="w-full sm:w-auto bg-obsidian text-ivory font-sans text-xs uppercase tracking-widest px-10 py-4 hover:bg-mauve transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {inCart ? 'Add Another' : 'Add to Cart'}
    </button>
  );
}
