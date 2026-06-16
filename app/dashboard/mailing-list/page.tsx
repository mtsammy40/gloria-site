import Link from 'next/link';
import { db } from '@/lib/db';
import { listSubscribers } from '@/lib/content/subscribers';
import { verifySession } from '@/lib/auth/session';

function formatDate(d: Date) {
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function MailingListPage() {
  await verifySession();
  const subscribers = await listSubscribers(db);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display italic text-3xl text-obsidian">Mailing list</h1>
          <p className="font-sans text-xs text-obsidian/40 mt-1">
            {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
          </p>
        </div>
        {subscribers.length > 0 && (
          <Link
            href="/dashboard/mailing-list/export"
            className="font-sans text-xs uppercase tracking-widest text-obsidian/50 border border-obsidian/20 px-4 py-2.5 hover:border-obsidian hover:text-obsidian transition-colors"
          >
            Export CSV
          </Link>
        )}
      </div>

      {subscribers.length === 0 ? (
        <div className="border border-obsidian/10 py-16 text-center rounded bg-white">
          <p className="font-sans text-sm text-obsidian/40">No subscribers yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-obsidian/10 rounded overflow-hidden">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-obsidian/10 text-xs uppercase tracking-widest text-obsidian/40">
                <th className="text-left px-4 py-3 font-normal">Email</th>
                <th className="text-left px-4 py-3 font-normal">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian/8">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-obsidian/2 transition-colors">
                  <td className="px-4 py-3 text-obsidian">{sub.email}</td>
                  <td className="px-4 py-3 text-obsidian/40 tabular-nums whitespace-nowrap">
                    {formatDate(sub.subscribedAt)}
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
