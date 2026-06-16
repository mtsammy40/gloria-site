'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart/cart-context';
import { startCheckout, type CheckoutState } from '@/app/actions/checkout';

const initialState: CheckoutState = { type: 'idle' };

const inputClass =
  'w-full bg-transparent border border-obsidian/20 px-4 py-3 text-sm font-sans text-obsidian placeholder:text-obsidian/30 focus:outline-none focus:border-obsidian/60 transition-colors';

export default function CheckoutPage() {
  const { cart, subtotal } = useCart();
  const router = useRouter();
  const [state, action, pending] = useActionState(startCheckout, initialState);
  const cartInputRef = useRef<HTMLInputElement>(null);

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0) router.replace('/cart');
  }, [cart.length, router]);

  // Keep hidden cart field in sync
  useEffect(() => {
    if (cartInputRef.current) {
      cartInputRef.current.value = JSON.stringify(cart);
    }
  }, [cart]);

  if (cart.length === 0) return null;

  return (
    <section className="bg-ivory min-h-screen px-6 lg:px-10 py-16 lg:py-20">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="font-display italic text-4xl lg:text-5xl text-obsidian">Checkout</h1>
        </header>

        <form action={action} className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* Serialised cart — validated server-side */}
          <input
            ref={cartInputRef}
            type="hidden"
            name="cart"
            defaultValue={JSON.stringify(cart)}
          />

          {/* Left: customer details */}
          <div className="space-y-8">
            <fieldset>
              <legend className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-5">
                Contact
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full name *"
                  required
                  className={inputClass}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address *"
                  required
                  className={inputClass}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-5">
                Shipping address
              </legend>
              <div className="space-y-4">
                <input
                  type="text"
                  name="street"
                  placeholder="Street address *"
                  required
                  className={inputClass}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    required
                    className={inputClass}
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country *"
                    required
                    className={inputClass}
                  />
                </div>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal code (optional)"
                  className={inputClass}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-5">
                Shipping region
              </legend>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'kenya', label: 'Kenya (3–5 days)' },
                  { value: 'international', label: 'International (7–14 days)' },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 border border-obsidian/15 px-4 py-3 cursor-pointer hover:border-obsidian/40 transition-colors has-[:checked]:border-obsidian"
                  >
                    <input
                      type="radio"
                      name="region"
                      value={value}
                      required
                      className="accent-obsidian"
                    />
                    <span className="font-sans text-sm text-obsidian/80">{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {state.type === 'error' && (
              <p className="text-xs font-sans text-mauve" role="alert">
                {state.message}
              </p>
            )}
          </div>

          {/* Right: order summary + submit */}
          <div>
            <div className="border border-obsidian/10 p-6 lg:p-8 sticky top-24">
              <h2 className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6 text-sm font-sans">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between gap-3">
                    <span className="text-obsidian/70 truncate">
                      {item.title}
                      {item.quantity > 1 && (
                        <span className="text-obsidian/40"> ×{item.quantity}</span>
                      )}
                    </span>
                    <span className="text-obsidian shrink-0">
                      {(item.priceKes * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-obsidian/10 pt-4 space-y-2 text-sm font-sans mb-8">
                <div className="flex justify-between">
                  <span className="text-obsidian/60">Subtotal</span>
                  <span className="text-obsidian">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-obsidian/60">Shipping</span>
                  <span className="text-obsidian/40">Calculated above</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-obsidian text-ivory font-sans text-xs uppercase tracking-widest py-4 hover:bg-mauve transition-colors disabled:opacity-50"
              >
                {pending ? 'Redirecting to payment…' : 'Pay with Paystack'}
              </button>

              <p className="mt-4 text-center font-sans text-xs text-obsidian/30">
                Card &amp; M-Pesa accepted · Secured by Paystack
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
