import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyTransaction } from '@/lib/paystack/paystack';
import { ClearCartOnMount } from '@/components/clear-cart-on-mount';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmation — Gloriah Mutheu Mwangangi',
};

type Props = { params: Promise<{ orderId: string }> };

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) notFound();

  // Best-effort reconciliation — webhook is the authoritative trigger
  if (order.status === 'pending_payment') {
    try {
      const txn = await verifyTransaction(order.id);
      if (txn.status === 'success') {
        // Webhook may not have arrived yet — the webhook handler is idempotent
        // so it's safe for it to process this order later
      }
    } catch {
      // Gateway unreachable — show current DB state
    }
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const isPaid = order.status === 'paid' || order.status === 'processing' ||
    order.status === 'shipped' || order.status === 'delivered';
  const isPending = order.status === 'pending_payment';

  return (
    <>
      {isPaid && <ClearCartOnMount />}
      <section className="bg-ivory min-h-screen px-6 lg:px-10 py-16 lg:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Status header */}
          <div className="flex flex-col items-center text-center mb-14">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${
                isPaid ? 'border border-sage' : 'border border-obsidian/20'
              }`}
            >
              {isPaid ? (
                <svg
                  className="w-6 h-6 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <span className="font-sans text-xs text-obsidian/30">?</span>
              )}
            </div>

            <h1 className="font-display italic text-3xl lg:text-4xl text-obsidian mb-3">
              {isPaid
                ? 'Thank you for your order.'
                : isPending
                  ? 'Payment pending…'
                  : 'Order cancelled.'}
            </h1>

            <p className="font-sans text-sm text-obsidian/60 max-w-sm leading-relaxed">
              {isPaid
                ? "Gloriah will be in touch with dispatch details. We're glad this work is going to a good home."
                : isPending
                  ? 'Your payment is being processed. This page will update once confirmed.'
                  : 'This order was not completed. Your cart has been preserved — please try again.'}
            </p>
          </div>

          {/* Order details */}
          <div className="border border-obsidian/10 p-6 lg:p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-1">
                  Order reference
                </p>
                <p className="font-sans text-sm text-obsidian font-mono">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-1">
                  Status
                </p>
                <p className="font-sans text-sm text-obsidian capitalize">
                  {order.status.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="border-t border-obsidian/10 pt-6 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm font-sans">
                  <span className="text-obsidian/70">
                    {item.titleSnapshot}
                    {item.quantity > 1 && (
                      <span className="text-obsidian/40"> ×{item.quantity}</span>
                    )}
                  </span>
                  <span className="text-obsidian">
                    KES {(item.priceKesSnapshot * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-obsidian/10 mt-4 pt-4 space-y-1 text-sm font-sans">
              <div className="flex justify-between">
                <span className="text-obsidian/60">Subtotal</span>
                <span className="text-obsidian">KES {order.subtotalKes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-obsidian/60">Shipping</span>
                <span className="text-obsidian">KES {order.shippingFeeKes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium mt-2 pt-2 border-t border-obsidian/10">
                <span className="text-obsidian">Total</span>
                <span className="text-obsidian">KES {order.totalKes.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/portfolio"
              className="text-center font-sans text-xs uppercase tracking-widest border border-obsidian text-obsidian px-8 py-4 hover:bg-obsidian hover:text-ivory transition-colors"
            >
              Explore the Portfolio
            </Link>
            {!isPaid && (
              <Link
                href="/cart"
                className="text-center font-sans text-xs uppercase tracking-widest text-obsidian/50 hover:text-obsidian border-b border-obsidian/20 hover:border-obsidian pb-px transition-colors self-center"
              >
                Return to Cart
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
