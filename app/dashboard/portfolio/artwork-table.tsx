'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ArtworkRow } from '@/lib/content/artworks';

type Props = {
  initialArtworks: ArtworkRow[];
  deleteAction: (id: string) => Promise<void>;
  reorderAction: (ids: string[]) => Promise<void>;
};

export function ArtworkTable({ initialArtworks, deleteAction, reorderAction }: Props) {
  const [artworks, setArtworks] = useState(initialArtworks);
  const [pending, startTransition] = useTransition();

  function move(index: number, dir: -1 | 1) {
    const next = [...artworks];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setArtworks(next);
    startTransition(() => reorderAction(next.map((a) => a.id)));
  }

  function confirmDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(() => deleteAction(id));
  }

  return (
    <div className="bg-white border border-obsidian/10 rounded overflow-hidden">
      {pending && (
        <div className="px-4 py-2 bg-sage/10 font-sans text-xs text-sage border-b border-sage/20">
          Saving…
        </div>
      )}
      <table className="w-full text-sm font-sans">
        <thead>
          <tr className="border-b border-obsidian/10 text-xs uppercase tracking-widest text-obsidian/40">
            <th className="text-left px-4 py-3 font-normal w-20">Order</th>
            <th className="text-left px-4 py-3 font-normal">Artwork</th>
            <th className="text-left px-4 py-3 font-normal hidden md:table-cell">Medium</th>
            <th className="text-left px-4 py-3 font-normal hidden lg:table-cell">Year</th>
            <th className="text-left px-4 py-3 font-normal">Featured</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-obsidian/8">
          {artworks.map((artwork, index) => (
            <tr key={artwork.id} className="hover:bg-obsidian/2 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || pending}
                    className="w-6 h-6 flex items-center justify-center text-obsidian/30 hover:text-obsidian disabled:opacity-20 transition-colors"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === artworks.length - 1 || pending}
                    className="w-6 h-6 flex items-center justify-center text-obsidian/30 hover:text-obsidian disabled:opacity-20 transition-colors"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 shrink-0 bg-obsidian/5">
                    {artwork.imageUrl && (
                      <Image
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <span className="font-display italic text-obsidian">{artwork.title}</span>
                </div>
              </td>

              <td className="px-4 py-3 text-obsidian/60 hidden md:table-cell">{artwork.medium}</td>

              <td className="px-4 py-3 text-obsidian/60 hidden lg:table-cell">
                {artwork.year ?? '—'}
              </td>

              <td className="px-4 py-3">
                {artwork.featured ? (
                  <span className="inline-flex items-center gap-1.5 font-sans text-xs text-sage">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                    Featured
                  </span>
                ) : (
                  <span className="font-sans text-xs text-obsidian/30">—</span>
                )}
              </td>

              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Link
                  href={`/dashboard/portfolio/${artwork.id}/edit`}
                  className="font-sans text-xs text-obsidian/50 hover:text-obsidian mr-4 transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => confirmDelete(artwork.id, artwork.title)}
                  className="font-sans text-xs text-obsidian/30 hover:text-mauve transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
