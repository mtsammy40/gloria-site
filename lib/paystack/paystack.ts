import crypto from 'crypto';

const PAYSTACK_API = 'https://api.paystack.co';

export type PaystackChannel = 'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer';

export type InitTransactionResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export type VerifyTransactionResult = {
  status: 'success' | 'failed' | 'abandoned' | 'pending';
  reference: string;
  amountKes: number;
  channel: PaystackChannel | null;
  paidAt: Date | null;
};

export type PaystackEvent =
  | { type: 'charge.success'; reference: string; amountKes: number; channel: PaystackChannel | null; paidAt: Date }
  | { type: 'charge.failed' | 'charge.abandoned'; reference: string }
  | { type: 'unknown'; raw: string };

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set');
  return key;
}

async function paystackFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${PAYSTACK_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Paystack API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Amount in Paystack is in the smallest currency unit.
// For KES: 1 KES = 100 cents, so multiply by 100.
export async function initializeTransaction(opts: {
  email: string;
  amountKes: number;
  reference: string;
  callbackUrl: string;
}): Promise<InitTransactionResult> {
  const data = await paystackFetch<{
    data: { authorization_url: string; access_code: string; reference: string };
  }>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: opts.email,
      amount: opts.amountKes * 100,
      reference: opts.reference,
      currency: 'KES',
      callback_url: opts.callbackUrl,
    }),
  });

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}

export async function verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
  const data = await paystackFetch<{
    data: {
      status: string;
      reference: string;
      amount: number;
      channel: string | null;
      paid_at: string | null;
    };
  }>(`/transaction/verify/${encodeURIComponent(reference)}`);

  const raw = data.data;
  const status =
    raw.status === 'success'
      ? 'success'
      : raw.status === 'failed'
        ? 'failed'
        : raw.status === 'abandoned'
          ? 'abandoned'
          : 'pending';

  return {
    status,
    reference: raw.reference,
    amountKes: Math.round(raw.amount / 100),
    channel: (raw.channel as PaystackChannel | null) ?? null,
    paidAt: raw.paid_at ? new Date(raw.paid_at) : null,
  };
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret) throw new Error('PAYSTACK_WEBHOOK_SECRET is not set');
  const expected = crypto.createHmac('sha512', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function parseWebhookEvent(payload: string): PaystackEvent {
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(payload);
  } catch {
    return { type: 'unknown', raw: payload };
  }

  const event = body.event as string;
  const data = (body.data ?? {}) as Record<string, unknown>;
  const reference = data.reference as string;

  if (event === 'charge.success') {
    return {
      type: 'charge.success',
      reference,
      amountKes: Math.round((data.amount as number) / 100),
      channel: (data.channel as PaystackChannel | null) ?? null,
      paidAt: data.paid_at ? new Date(data.paid_at as string) : new Date(),
    };
  }

  if (event === 'charge.failed') {
    return { type: 'charge.failed', reference };
  }

  if (event === 'charge.abandoned') {
    return { type: 'charge.abandoned', reference };
  }

  return { type: 'unknown', raw: payload };
}
