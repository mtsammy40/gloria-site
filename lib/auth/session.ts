import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'gloria_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

function jwtSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error('SESSION_SECRET must be set and at least 32 characters');
  return new TextEncoder().encode(secret);
}

type SessionPayload = { adminId: string };

export async function createSession(adminId: string): Promise<void> {
  const token = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(jwtSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_SECONDS,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, jwtSecret());
    if (typeof payload.adminId !== 'string') return null;
    return { adminId: payload.adminId };
  } catch {
    return null;
  }
}

export async function verifySession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function deleteSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
