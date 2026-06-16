'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart/cart-context';

export function CartCount() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="relative font-sans text-xs uppercase tracking-widest text-obsidian/70 hover:text-obsidian transition-colors"
      aria-label={`Cart — ${count} item${count !== 1 ? 's' : ''}`}
    >
      Cart
      {count > 0 && (
        <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[9px] bg-obsidian text-ivory rounded-full">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
