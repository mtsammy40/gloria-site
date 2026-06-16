'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { markInquiryRead } from '@/lib/content/inquiries';
import { verifySession } from '@/lib/auth/session';

export async function markInquiryReadAction(id: string, read: boolean): Promise<void> {
  await verifySession();
  await markInquiryRead(db, id, read);
  revalidatePath('/dashboard/inquiries');
}
