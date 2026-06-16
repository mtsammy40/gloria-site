import { desc } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { mailingListSubscribers } from '@/lib/db/schema';

export type SubscriberRow = typeof mailingListSubscribers.$inferSelect;

export async function listSubscribers(db: DB): Promise<SubscriberRow[]> {
  return db.select().from(mailingListSubscribers).orderBy(desc(mailingListSubscribers.subscribedAt));
}
