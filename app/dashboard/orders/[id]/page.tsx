import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getOrderWithDetails } from '@/lib/content/orders';
import { verifySession } from '@/lib/auth/session';
import { StatusSelect } from './status-select';

type Props = { params: Promise<{ id: string }> };

const ALL_STATUSES = [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

function formatKes(n: number) {
  return `KES ${n.toLocaleString()}`;
}

function formatDate(d: Date) {
  return d.toLocaleString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-obsidian/8 last:border-0">
      <span className="font-sans text-xs text-obsidian/40">{label}</span>
      <span className="font-sans text-sm text-obsidian text-right">{value}</span>
    </div>
  );
}

export default async function OrderDetailPage({ params }: Props) {
  await verifySession();
  const { id } = await params;
  const order = await getOrderWithDetails(db, id);
  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/orders"
          className="font-sans text-xs text-obsidian/40 hover:text-obsidian transition-colors"
        >
          ← Orders
        </Link>
        <div>
          <h1 className="font-display italic text-3xl text-obsidian">Order</h1>
          <p className="font-sans text-xs text-obsidian/40 font-mono mt-0.5">{order.id}</p>
        </div>
      </div>

      {order.needsReview && (
        <div className="mb-6 px-4 py-3 bg-mauve/10 border border-mauve/20 rounded font-sans text-sm text-mauve">
          This order needs review — stock was insufficient at checkout time. Verify inventory before fulfilling.
        </div>
      )}

      {/* Status update */}
      <div className="bg-white border border-obsidian/10 rounded p-6 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs uppercase tracking-widest text-obsidian/40">Status</span>
          <StatusSelect orderId={order.id} currentStatus={order.status} statuses={ALL_STATUSES} labels={STATUS_LABELS} />
        </div>
      </div>

      {/* Customer & shipping */}
      <div className="bg-white border border-obsidian/10 rounded p-6 mb-4">
        <h2 className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-3">
          Customer
        </h2>
        <Row label="Name" value={order.customerName} />
        <Row label="Email" value={order.customerEmail} />
        <Row label="Address" value={`${order.shippingStreet}, ${order.shippingCity}`} />
        <Row label="Country" value={order.shippingCountry} />
        {order.shippingPostalCode && <Row label="Postal code" value={order.shippingPostalCode} />}
        <Row label="Shipping region" value={order.shippingRegion} />
      </div>

      {/* Line items */}
      <div className="bg-white border border-obsidian/10 rounded p-6 mb-4">
        <h2 className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-3">
          Items
        </h2>
        <div className="divide-y divide-obsidian/8">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2.5">
              <div>
                <span className="font-sans text-sm text-obsidian">{item.titleSnapshot}</span>
                {item.quantity > 1 && (
                  <span className="font-sans text-xs text-obsidian/40 ml-2">× {item.quantity}</span>
                )}
              </div>
              <span className="font-sans text-sm text-obsidian tabular-nums">
                {formatKes(item.priceKesSnapshot * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-obsidian/10 space-y-1">
          <Row label="Subtotal" value={formatKes(order.subtotalKes)} />
          <Row label="Shipping" value={formatKes(order.shippingFeeKes)} />
          <div className="flex justify-between py-2.5">
            <span className="font-sans text-sm font-medium text-obsidian">Total</span>
            <span className="font-sans text-sm font-medium text-obsidian tabular-nums">
              {formatKes(order.totalKes)}
            </span>
          </div>
        </div>
      </div>

      {/* Payments */}
      {order.payments.length > 0 && (
        <div className="bg-white border border-obsidian/10 rounded p-6 mb-4">
          <h2 className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-3">
            Payments
          </h2>
          {order.payments.map((p) => (
            <div key={p.id} className="divide-y divide-obsidian/8">
              <Row label="Reference" value={<span className="font-mono text-xs">{p.paystackReference}</span>} />
              <Row label="Status" value={p.status} />
              <Row label="Amount" value={formatKes(p.amountKes)} />
              {p.channel && <Row label="Channel" value={p.channel} />}
              {p.paidAt && <Row label="Paid at" value={formatDate(p.paidAt)} />}
            </div>
          ))}
        </div>
      )}

      <div className="font-sans text-xs text-obsidian/30 pb-4">
        Created {formatDate(order.createdAt)} · Last updated {formatDate(order.updatedAt)}
      </div>
    </div>
  );
}
