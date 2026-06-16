'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { updateOrderStatus } from '@/lib/content/orders';
import { verifySession } from '@/lib/auth/session';
import type { OrderRow } from '@/lib/content/orders';

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderRow['status'],
): Promise<void> {
  await verifySession();
  await updateOrderStatus(db, orderId, status);
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath('/dashboard/orders');
}
