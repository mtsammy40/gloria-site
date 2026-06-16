'use server';

import { db } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schema';
import { getSiteSettings } from '@/lib/content/settings';
import { sendNewInquiryNotification } from '@/lib/email/resend';

const SUBJECTS = ['originals', 'prints', 'interior', 'commission', 'general'] as const;
type Subject = (typeof SUBJECTS)[number];

export type ContactState =
  | { type: 'idle' }
  | { type: 'success' }
  | { type: 'error'; message: string };

export async function submitContactForm(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = formData.get('name')?.toString().trim() ?? '';
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
  const subject = formData.get('subject')?.toString() ?? '';
  const message = formData.get('message')?.toString().trim() ?? '';

  if (!name) return { type: 'error', message: 'Please enter your name.' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { type: 'error', message: 'Please enter a valid email address.' };
  if (!SUBJECTS.includes(subject as Subject))
    return { type: 'error', message: 'Please select a subject.' };
  if (!message) return { type: 'error', message: 'Please include a message.' };

  try {
    await db.insert(contactSubmissions).values({
      name,
      email,
      subject: subject as Subject,
      message,
    });
  } catch {
    return { type: 'error', message: 'Something went wrong. Please try again.' };
  }

  // Notify admin — fire-and-forget
  getSiteSettings(db)
    .then((s) => {
      const adminEmail = s.contactEmail || 'hello@gloriahmutheu.com';
      return sendNewInquiryNotification({
        adminEmail,
        senderName: name,
        senderEmail: email,
        subject,
        message,
      });
    })
    .catch(() => {});

  return { type: 'success' };
}
