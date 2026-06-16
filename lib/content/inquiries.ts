import { desc, eq } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schema';

export type InquiryRow = typeof contactSubmissions.$inferSelect;

export async function listInquiries(db: DB): Promise<InquiryRow[]> {
  return db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt));
}

export async function markInquiryRead(db: DB, id: string, read: boolean): Promise<void> {
  await db.update(contactSubmissions).set({ read }).where(eq(contactSubmissions.id, id));
}
