'use client';

import { useTransition } from 'react';
import { updateOrderStatusAction } from '@/app/actions/orders';
import type { OrderRow } from '@/lib/content/orders';

type Props = {
  orderId: string;
  currentStatus: OrderRow['status'];
  statuses: readonly OrderRow['status'][];
  labels: Record<string, string>;
};

export function StatusSelect({ orderId, currentStatus, statuses, labels }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as OrderRow['status'];
    startTransition(() => updateOrderStatusAction(orderId, status));
  }

  return (
    <div className="flex items-center gap-3">
      {isPending && (
        <span className="font-sans text-xs text-obsidian/30">Saving…</span>
      )}
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="border border-obsidian/20 bg-ivory/50 px-3 py-1.5 font-sans text-sm text-obsidian focus:outline-none focus:border-obsidian transition-colors disabled:opacity-50"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {labels[s] ?? s}
          </option>
        ))}
      </select>
    </div>
  );
}
