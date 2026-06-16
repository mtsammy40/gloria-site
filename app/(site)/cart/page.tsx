'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart/cart-context';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal } = useCart();

  if (cart.length === 0) {
    return (
      <section className="bg-ivory min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-display italic text-3xl text-obsidian mb-4">Your cart is empty</h1>
        <p className="font-sans text-sm text-obsidian/50 mb-8">
          Discover original works and limited prints.
        </p>
        <Link
          href="/shop"
          className="font-sans text-xs uppercase tracking-widest border border-obsidian text-obsidian px-8 py-4 hover:bg-obsidian hover:text-ivory transition-colors"
        >
          Browse the Shop
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-ivory min-h-screen px-6 lg:px-10 py-16 lg:py-20">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="font-display italic text-4xl lg:text-5xl text-obsidian">Your Cart</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16">
          {/* Line items */}
          <div className="space-y-0 divide-y divide-obsidian/10">
            {cart.map((item) => {
              const maxQty = item.type === 'original' ? 1 : item.stockRemaining;
              return (
                <div key={item.productId} className="flex gap-5 py-6">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 shrink-0 bg-obsidian/5">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <h2 className="font-display italic text-base text-obsidian leading-snug">
                        {item.title}
                      </h2>
                      <p className="font-sans text-xs text-obsidian/50 mt-1">
                        {[item.medium, item.dimensions].filter(Boolean).join(' · ')}
                      </p>
                      <p className="font-sans text-xs text-obsidian/40 mt-0.5 capitalize">
                        {item.type === 'print' ? 'Limited Print' : 'Original'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      {/* Quantity control */}
                      {item.type === 'print' ? (
                        <div className="flex items-center border border-obsidian/20">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center font-sans text-sm text-obsidian/60 hover:text-obsidian transition-colors"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-sans text-sm text-obsidian">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= maxQty}
                            className="w-8 h-8 flex items-center justify-center font-sans text-sm text-obsidian/60 hover:text-obsidian disabled:opacity-30 transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="font-sans text-xs text-obsidian/40 uppercase tracking-widest">
                          Qty 1
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="font-sans text-xs text-obsidian/30 hover:text-obsidian transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="font-sans text-sm text-obsidian">
                      KES {(item.priceKes * item.quantity).toLocaleString()}
                    </p>
                    {item.quantity > 1 && (
                      <p className="font-sans text-xs text-obsidian/40 mt-1">
                        {item.quantity} × {item.priceKes.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div>
            <div className="border border-obsidian/10 p-6 lg:p-8 sticky top-24">
              <h2 className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-6">
                Order Summary
              </h2>

              <div className="flex justify-between mb-2">
                <span className="font-sans text-sm text-obsidian/70">Subtotal</span>
                <span className="font-sans text-sm text-obsidian">
                  KES {subtotal.toLocaleString()}
                </span>
              </div>
              <p className="font-sans text-xs text-obsidian/40 mb-8 leading-relaxed">
                Shipping calculated at checkout.
              </p>

              <Link
                href="/checkout"
                className="block text-center bg-obsidian text-ivory font-sans text-xs uppercase tracking-widest px-6 py-4 hover:bg-mauve transition-colors"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="block text-center mt-4 font-sans text-xs text-obsidian/40 hover:text-obsidian transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
