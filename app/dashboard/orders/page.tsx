import Link from 'next/link';
import { db } from '@/lib/db';
import { listOrders } from '@/lib/content/orders';
import { verifySession } from '@/lib/auth/session';

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'text-obsidian/40',
  paid: 'text-sage',
  processing: 'text-mauve',
  shipped: 'text-mauve',
  delivered: 'text-sage',
  cancelled: 'text-obsidian/30',
  refunded: 'text-obsidian/30',
};

function formatKes(n: number) {
  return `KES ${n.toLocaleString()}`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function OrdersDashboardPage() {
  await verifySession();
  const orders = await listOrders(db);

  const paidCount = orders.filter((o) => o.status === 'paid' || o.status === 'processing').length;
  const needsReviewCount = orders.filter((o) => o.needsReview).length;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display italic text-3xl text-obsidian">Orders</h1>
        <p className="font-sans text-xs text-obsidian/40 mt-1">
          {orders.length} total · {paidCount} active
          {needsReviewCount > 0 && (
            <span className="ml-2 text-mauve">· {needsReviewCount} need review</span>
          )}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="border border-obsidian/10 py-16 text-center rounded bg-white">
          <p className="font-sans text-sm text-obsidian/40">No orders yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-obsidian/10 rounded overflow-hidden">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-obsidian/10 text-xs uppercase tracking-widest text-obsidian/40">
                <th className="text-left px-4 py-3 font-normal">Date</th>
                <th className="text-left px-4 py-3 font-normal">Customer</th>
                <th className="text-left px-4 py-3 font-normal hidden md:table-cell">Country</th>
                <th className="text-left px-4 py-3 font-normal">Total</th>
                <th className="text-left px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian/8">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className={`hover:bg-obsidian/2 transition-colors ${order.needsReview ? 'bg-mauve/5' : ''}`}
                >
                  <td className="px-4 py-3 text-obsidian/60 tabular-nums whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-obsidian">{order.customerName}</span>
                      <div className="text-obsidian/40 text-xs">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-obsidian/60 hidden md:table-cell">
                    {order.shippingCountry}
                  </td>
                  <td className="px-4 py-3 text-obsidian tabular-nums">
                    {formatKes(order.totalKes)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-sans text-xs ${STATUS_COLORS[order.status] ?? 'text-obsidian/60'}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      {order.needsReview && (
                        <span className="font-sans text-xs text-mauve bg-mauve/10 px-1.5 py-0.5 rounded">
                          Review
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-sans text-xs text-obsidian/50 hover:text-obsidian transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
