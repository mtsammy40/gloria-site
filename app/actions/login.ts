'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createSession, deleteSession } from '@/lib/auth/session';

export type LoginState = { type: 'idle' } | { type: 'error'; message: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
  const password = formData.get('password')?.toString() ?? '';

  if (!email || !password) return { type: 'error', message: 'Email and password are required.' };

  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);

  // Constant-time comparison to avoid timing attacks
  const validPassword = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!admin || !validPassword) {
    return { type: 'error', message: 'Invalid email or password.' };
  }

  await createSession(admin.id);
  redirect('/dashboard');
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
