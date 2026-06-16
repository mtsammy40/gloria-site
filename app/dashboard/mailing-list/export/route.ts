import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listSubscribers } from '@/lib/content/subscribers';
import { verifySession } from '@/lib/auth/session';

export async function GET() {
  await verifySession();
  const subscribers = await listSubscribers(db);

  const csv = [
    'email,subscribed_at',
    ...subscribers.map(
      (s) => `${s.email},${s.subscribedAt.toISOString()}`,
    ),
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="mailing-list-${Date.now()}.csv"`,
    },
  });
}
