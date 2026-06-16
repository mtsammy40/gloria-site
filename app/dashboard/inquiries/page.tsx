import { db } from '@/lib/db';
import { listInquiries } from '@/lib/content/inquiries';
import { verifySession } from '@/lib/auth/session';
import { InquiryList } from './inquiry-list';

export default async function InquiriesPage() {
  await verifySession();
  const inquiries = await listInquiries(db);
  const unreadCount = inquiries.filter((i) => !i.read).length;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display italic text-3xl text-obsidian">Inquiries</h1>
        <p className="font-sans text-xs text-obsidian/40 mt-1">
          {inquiries.length} total · {unreadCount} unread
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="border border-obsidian/10 py-16 text-center rounded bg-white">
          <p className="font-sans text-sm text-obsidian/40">No inquiries yet.</p>
        </div>
      ) : (
        <InquiryList initialInquiries={inquiries} />
      )}
    </div>
  );
}
