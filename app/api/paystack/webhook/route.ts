import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, payments, products } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { verifyWebhookSignature, parseWebhookEvent } from '@/lib/paystack/paystack';
import { decrementInventory } from '@/lib/orders/engine';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';

  // Verify signature — reject early on mismatch
  let valid: boolean;
  try {
    valid = verifyWebhookSignature(payload, signature);
  } catch {
    return NextResponse.json({ error: 'Misconfigured webhook secret' }, { status: 500 });
  }
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = parseWebhookEvent(payload);

  if (event.type === 'charge.success') {
    await handleChargeSuccess(event.reference, event.amountKes, event.channel, event.paidAt);
  } else if (event.type === 'charge.failed' || event.type === 'charge.abandoned') {
    await handleChargeFailed(event.reference, event.type === 'charge.abandoned' ? 'abandoned' : 'failed');
  }

  // Always return 200 — Paystack retries on non-2xx
  return NextResponse.json({ received: true });
}

async function handleChargeSuccess(
  reference: string,
  amountKes: number,
  channel: string | null,
  paidAt: Date,
) {
  const [order] = await db.select().from(orders).where(eq(orders.id, reference)).limit(1);
  if (!order || order.status !== 'pending_payment') return; // idempotent

  // Decrement inventory
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const productIds = items.map((i) => i.productId).filter(Boolean) as string[];
  const dbProducts = productIds.length
    ? await db.select().from(products).where(inArray(products.id, productIds))
    : [];

  const inventory = dbProducts.map((p) => ({
    productId: p.id,
    stockRemaining: p.stockRemaining,
    manuallyMarkedSold: p.manuallyMarkedSold,
  }));

  const lines = items
    .filter((i) => i.productId)
    .map((i) => ({
      productId: i.productId!,
      priceKes: i.priceKesSnapshot,
      quantity: i.quantity,
    }));

  const { decrements, needsReview } = decrementInventory(lines, inventory);

  // Apply decrements
  await Promise.all(
    decrements.map((d) =>
      db
        .update(products)
        .set({ stockRemaining: d.newStockRemaining, updatedAt: new Date() })
        .where(eq(products.id, d.productId)),
    ),
  );

  // Record payment
  await db.insert(payments).values({
    orderId: order.id,
    paystackReference: reference,
    status: 'success',
    amountKes,
    channel: channel ?? null,
    paidAt,
    rawPayload: null,
  }).onConflictDoNothing();

  // Transition order to paid
  await db
    .update(orders)
    .set({ status: 'paid', needsReview, updatedAt: new Date() })
    .where(eq(orders.id, order.id));
}

async function handleChargeFailed(
  reference: string,
  paystackStatus: 'failed' | 'abandoned',
) {
  const [order] = await db.select().from(orders).where(eq(orders.id, reference)).limit(1);
  if (!order || order.status !== 'pending_payment') return;

  await db.insert(payments).values({
    orderId: order.id,
    paystackReference: reference,
    status: paystackStatus,
    amountKes: 0,
    channel: null,
    paidAt: null,
    rawPayload: null,
  }).onConflictDoNothing();

  await db
    .update(orders)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(orders.id, order.id));
}
