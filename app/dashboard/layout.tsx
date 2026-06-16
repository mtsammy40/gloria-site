import Link from 'next/link';
import { verifySession } from '@/lib/auth/session';
import { logout } from '@/app/actions/login';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', exact: true },
  { href: '/dashboard/portfolio', label: 'Portfolio' },
  { href: '/dashboard/shop', label: 'Shop' },
  { href: '/dashboard/orders', label: 'Orders' },
  { href: '/dashboard/content', label: 'Site Content' },
  { href: '/dashboard/mailing-list', label: 'Mailing List' },
  { href: '/dashboard/inquiries', label: 'Inquiries' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await verifySession();

  return (
    <div className="min-h-screen bg-[#F5F4F2] flex flex-col">
      {/* Top bar */}
      <header className="bg-obsidian text-ivory h-14 flex items-center justify-between px-6 shrink-0">
        <span className="font-display italic text-base text-ivory">Dashboard</span>
        <form action={logout}>
          <button
            type="submit"
            className="font-sans text-xs uppercase tracking-widest text-ivory/40 hover:text-ivory transition-colors"
          >
            Sign out
          </button>
        </form>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 bg-white border-r border-obsidian/8 flex flex-col">
          <nav className="flex-1 py-6">
            <ul className="space-y-0.5 px-3">
              {NAV_ITEMS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block px-3 py-2 font-sans text-sm text-obsidian/70 hover:text-obsidian hover:bg-obsidian/4 rounded transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="px-6 py-4 border-t border-obsidian/8">
            <Link
              href="/"
              target="_blank"
              className="font-sans text-xs text-obsidian/40 hover:text-obsidian transition-colors"
            >
              View site →
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
