import Link from 'next/link';
import { db } from '@/lib/db';
import { orders, contactSubmissions, mailingListSubscribers } from '@/lib/db/schema';
import { eq, count, gte } from 'drizzle-orm';
import { verifySession } from '@/lib/auth/session';

async function getOverviewStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [newOrders, unreadEnquiries, recentSubscribers] = await Promise.all([
    db.select({ count: count() }).from(orders).where(eq(orders.status, 'paid')),
    db.select({ count: count() }).from(contactSubmissions).where(eq(contactSubmissions.read, false)),
    db
      .select({ count: count() })
      .from(mailingListSubscribers)
      .where(gte(mailingListSubscribers.subscribedAt, thirtyDaysAgo)),
  ]);

  return {
    newOrders: newOrders[0]?.count ?? 0,
    unreadEnquiries: unreadEnquiries[0]?.count ?? 0,
    recentSubscribers: recentSubscribers[0]?.count ?? 0,
  };
}

const QUICK_LINKS = [
  { href: '/dashboard/orders', label: 'Manage orders' },
  { href: '/dashboard/portfolio', label: 'Add artwork' },
  { href: '/dashboard/shop', label: 'Update shop' },
  { href: '/dashboard/inquiries', label: 'View enquiries' },
  { href: '/dashboard/content', label: 'Edit site content' },
  { href: '/dashboard/mailing-list', label: 'Export subscribers' },
];

export default async function DashboardOverviewPage() {
  await verifySession();
  const stats = await getOverviewStats();

  const statCards = [
    {
      label: 'Paid orders',
      value: stats.newOrders,
      sub: 'awaiting processing',
      href: '/dashboard/orders',
      alert: stats.newOrders > 0,
    },
    {
      label: 'Unread enquiries',
      value: stats.unreadEnquiries,
      sub: 'contact submissions',
      href: '/dashboard/inquiries',
      alert: stats.unreadEnquiries > 0,
    },
    {
      label: 'New subscribers',
      value: stats.recentSubscribers,
      sub: 'last 30 days',
      href: '/dashboard/mailing-list',
      alert: false,
    },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-display italic text-3xl text-obsidian mb-8">Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {statCards.map(({ label, value, sub, href, alert }) => (
          <Link
            key={href}
            href={href}
            className="bg-white border border-obsidian/10 p-6 hover:border-obsidian/30 transition-colors rounded"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-sans text-xs uppercase tracking-widest text-obsidian/40">
                {label}
              </span>
              {alert && (
                <span className="w-2 h-2 rounded-full bg-mauve shrink-0 mt-0.5" />
              )}
            </div>
            <p className="font-display italic text-4xl text-obsidian">{value}</p>
            <p className="font-sans text-xs text-obsidian/40 mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-4">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-obsidian/10 px-4 py-3 font-sans text-sm text-obsidian/70 hover:text-obsidian hover:border-obsidian/30 transition-colors rounded"
            >
              {label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
