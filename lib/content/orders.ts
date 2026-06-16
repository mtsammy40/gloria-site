import { desc, eq } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { orders, orderItems, payments } from '@/lib/db/schema';

export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;

export type OrderWithDetails = OrderRow & {
  items: OrderItemRow[];
  payments: PaymentRow[];
};

export async function listOrders(db: DB): Promise<OrderRow[]> {
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderWithDetails(db: DB, id: string): Promise<OrderWithDetails | null> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true, payments: true },
  });
  return order ?? null;
}

export async function updateOrderStatus(
  db: DB,
  id: string,
  status: OrderRow['status'],
): Promise<void> {
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
}
