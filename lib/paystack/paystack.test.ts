import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

// Set env vars before importing the module
process.env.PAYSTACK_SECRET_KEY = 'sk_test_abc123';
process.env.PAYSTACK_WEBHOOK_SECRET = 'wh_secret_xyz';

import {
  initializeTransaction,
  verifyTransaction,
  verifyWebhookSignature,
  parseWebhookEvent,
} from './paystack';

function makeSignature(payload: string, secret = 'wh_secret_xyz'): string {
  return crypto.createHmac('sha512', secret).update(payload).digest('hex');
}

function mockFetch(data: unknown, ok = true, status = 200) {
  return vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    }),
  );
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('initializeTransaction', () => {
  it('calls the Paystack API with the correct body and returns mapped result', async () => {
    mockFetch({
      data: {
        authorization_url: 'https://checkout.paystack.com/xyz',
        access_code: 'acc_123',
        reference: 'order_abc',
      },
    });

    const result = await initializeTransaction({
      email: 'buyer@example.com',
      amountKes: 120000,
      reference: 'order_abc',
      callbackUrl: 'https://site.com/order-confirmation/order_abc',
    });

    expect(result.authorizationUrl).toBe('https://checkout.paystack.com/xyz');
    expect(result.reference).toBe('order_abc');

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    // Amount must be in KES cents (× 100)
    expect(body.amount).toBe(120000 * 100);
    expect(body.currency).toBe('KES');
    expect(body.reference).toBe('order_abc');
  });

  it('throws when the API returns a non-OK response', async () => {
    mockFetch({ message: 'Invalid key' }, false, 401);
    await expect(
      initializeTransaction({ email: 'a@b.com', amountKes: 1000, reference: 'r', callbackUrl: 'u' }),
    ).rejects.toThrow('401');
  });
});

describe('verifyTransaction', () => {
  it('maps a successful transaction correctly', async () => {
    mockFetch({
      data: {
        status: 'success',
        reference: 'order_abc',
        amount: 12000000, // 120000 KES in cents
        channel: 'card',
        paid_at: '2026-06-01T10:00:00.000Z',
      },
    });

    const result = await verifyTransaction('order_abc');

    expect(result.status).toBe('success');
    expect(result.amountKes).toBe(120000);
    expect(result.channel).toBe('card');
    expect(result.paidAt).toBeInstanceOf(Date);
  });

  it('maps a failed transaction correctly', async () => {
    mockFetch({
      data: { status: 'failed', reference: 'order_abc', amount: 0, channel: null, paid_at: null },
    });
    const result = await verifyTransaction('order_abc');
    expect(result.status).toBe('failed');
    expect(result.paidAt).toBeNull();
  });
});

describe('verifyWebhookSignature', () => {
  it('returns true for a valid signature', () => {
    const payload = JSON.stringify({ event: 'charge.success' });
    const sig = makeSignature(payload);
    expect(verifyWebhookSignature(payload, sig)).toBe(true);
  });

  it('returns false for a tampered payload', () => {
    const payload = JSON.stringify({ event: 'charge.success' });
    const sig = makeSignature(payload);
    const tampered = JSON.stringify({ event: 'charge.success', injected: true });
    expect(verifyWebhookSignature(tampered, sig)).toBe(false);
  });

  it('returns false for a wrong secret', () => {
    const payload = JSON.stringify({ event: 'charge.success' });
    const sig = makeSignature(payload, 'wrong_secret');
    expect(verifyWebhookSignature(payload, sig)).toBe(false);
  });
});

describe('parseWebhookEvent', () => {
  it('parses charge.success', () => {
    const payload = JSON.stringify({
      event: 'charge.success',
      data: {
        reference: 'ref123',
        amount: 1500000,
        channel: 'mobile_money',
        paid_at: '2026-06-01T12:00:00Z',
      },
    });
    const evt = parseWebhookEvent(payload);
    expect(evt.type).toBe('charge.success');
    if (evt.type === 'charge.success') {
      expect(evt.reference).toBe('ref123');
      expect(evt.amountKes).toBe(15000);
      expect(evt.channel).toBe('mobile_money');
    }
  });

  it('parses charge.failed', () => {
    const payload = JSON.stringify({ event: 'charge.failed', data: { reference: 'ref456' } });
    const evt = parseWebhookEvent(payload);
    expect(evt.type).toBe('charge.failed');
  });

  it('returns unknown for unrecognised events', () => {
    const payload = JSON.stringify({ event: 'subscription.create', data: {} });
    const evt = parseWebhookEvent(payload);
    expect(evt.type).toBe('unknown');
  });

  it('returns unknown for invalid JSON', () => {
    const evt = parseWebhookEvent('not json');
    expect(evt.type).toBe('unknown');
  });
});
