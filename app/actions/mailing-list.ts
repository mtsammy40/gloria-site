'use server';

import { db } from '@/lib/db';
import { mailingListSubscribers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type MailingListState =
  | { type: 'idle' }
  | { type: 'success' | 'already_subscribed' | 'error'; message: string };

export async function subscribeToMailingList(
  _prev: MailingListState,
  formData: FormData,
): Promise<MailingListState> {
  const raw = formData.get('email');
  const email = typeof raw === 'string' ? raw.trim().toLowerCase() : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { type: 'error', message: 'Please enter a valid email address.' };
  }

  try {
    const existing = await db.query.mailingListSubscribers.findFirst({
      where: eq(mailingListSubscribers.email, email),
    });

    if (existing) {
      return { type: 'already_subscribed', message: "You're already on the list — thank you." };
    }

    await db.insert(mailingListSubscribers).values({ email });
    return { type: 'success', message: "You're on the list. Thank you." };
  } catch {
    return { type: 'error', message: 'Something went wrong. Please try again.' };
  }
}
