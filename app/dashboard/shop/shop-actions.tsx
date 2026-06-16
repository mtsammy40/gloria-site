'use client';

import { useTransition } from 'react';
import { deleteProductAction } from '@/app/actions/products';

type Props = { id: string; title: string; type: string };

export function ShopActions({ id, title, type }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete the ${type} listing for "${title}"? This cannot be undone.`)) return;
    startTransition(() => deleteProductAction(id));
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="font-sans text-xs text-obsidian/30 hover:text-mauve disabled:opacity-40 transition-colors"
    >
      {isPending ? '…' : 'Delete'}
    </button>
  );
}
