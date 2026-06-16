import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'gloria_session';

function jwtSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const secret = jwtSecret();
  if (!secret) {
    // Misconfigured — block access rather than open a security hole
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
