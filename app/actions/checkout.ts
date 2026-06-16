'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/lib/db/schema';
import { getSiteSettings } from '@/lib/content/settings';
import { initializeTransaction } from '@/lib/paystack/paystack';
import { computeOrderTotals } from '@/lib/orders/engine';
import { eq, inArray } from 'drizzle-orm';
import type { CartItem } from '@/lib/cart/cart';

export type CheckoutState =
  | { type: 'idle' }
  | { type: 'error'; message: string };

export async function startCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  // ── Parse form fields ────────────────────────────────────────────────────────
  const name = formData.get('name')?.toString().trim() ?? '';
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
  const street = formData.get('street')?.toString().trim() ?? '';
  const city = formData.get('city')?.toString().trim() ?? '';
  const country = formData.get('country')?.toString().trim() ?? '';
  const postalCode = formData.get('postalCode')?.toString().trim() ?? '';
  const region = formData.get('region')?.toString() as 'kenya' | 'international' | '';
  const cartJson = formData.get('cart')?.toString() ?? '[]';

  if (!name) return { type: 'error', message: 'Name is required.' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { type: 'error', message: 'A valid email is required.' };
  if (!street || !city || !country) return { type: 'error', message: 'Full shipping address is required.' };
  if (region !== 'kenya' && region !== 'international')
    return { type: 'error', message: 'Select a shipping region.' };

  let cartItems: CartItem[];
  try {
    cartItems = JSON.parse(cartJson);
    if (!Array.isArray(cartItems) || cartItems.length === 0)
      return { type: 'error', message: 'Your cart is empty.' };
  } catch {
    return { type: 'error', message: 'Invalid cart data.' };
  }

  // ── Re-validate prices and availability against DB ───────────────────────────
  const productIds = cartItems.map((i) => i.productId);
  const dbProducts = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));

  const dbById = new Map(dbProducts.map((p) => [p.id, p]));
  const lines: { productId: string; priceKes: number; quantity: number }[] = [];

  for (const item of cartItems) {
    const dbProduct = dbById.get(item.productId);
    if (!dbProduct) return { type: 'error', message: `"${item.title}" is no longer available.` };
    if (dbProduct.manuallyMarkedSold || dbProduct.stockRemaining < item.quantity)
      return { type: 'error', message: `"${item.title}" is no longer available in the requested quantity.` };
    lines.push({ productId: item.productId, priceKes: dbProduct.priceKes, quantity: item.quantity });
  }

  // ── Compute totals ──────────────────────────────────────────────────────────
  const settings = await getSiteSettings(db);
  const shippingFee =
    region === 'kenya' ? settings.shippingFeeKenyaKes : settings.shippingFeeInternationalKes;
  const { subtotalKes, shippingFeeKes, totalKes } = computeOrderTotals(lines, shippingFee);

  // ── Create order ────────────────────────────────────────────────────────────
  const [order] = await db
    .insert(orders)
    .values({
      customerName: name,
      customerEmail: email,
      shippingStreet: street,
      shippingCity: city,
      shippingCountry: country,
      shippingPostalCode: postalCode || null,
      shippingRegion: region,
      subtotalKes,
      shippingFeeKes,
      totalKes,
      status: 'pending_payment',
    })
    .returning();

  await db.insert(orderItems).values(
    cartItems.map((item) => {
      const dbProduct = dbById.get(item.productId)!;
      return {
        orderId: order.id,
        productId: item.productId,
        titleSnapshot: item.title,
        priceKesSnapshot: dbProduct.priceKes,
        quantity: item.quantity,
      };
    }),
  );

  // ── Initialize Paystack transaction ─────────────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  let authorizationUrl: string;
  try {
    const txn = await initializeTransaction({
      email,
      amountKes: totalKes,
      reference: order.id,
      callbackUrl: `${baseUrl}/order-confirmation/${order.id}`,
    });
    authorizationUrl = txn.authorizationUrl;
  } catch (err) {
    // Roll back the order so the customer can retry
    await db.delete(orders).where(eq(orders.id, order.id));
    const msg = err instanceof Error ? err.message : 'Payment gateway error.';
    return { type: 'error', message: `Could not connect to payment gateway: ${msg}` };
  }

  redirect(authorizationUrl);
}
