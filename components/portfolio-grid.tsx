'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ArtworkRow } from '@/lib/content/artworks';

type Props = {
  artworks: ArtworkRow[];
  mediums: string[];
};

export function PortfolioGrid({ artworks, mediums }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filtered =
    activeFilter === 'All' ? artworks : artworks.filter((a) => a.medium === activeFilter);

  const tabs = ['All', ...mediums];

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 mb-12 lg:mb-16 border-b border-mauve/20 pb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={[
              'px-4 py-2 text-xs uppercase tracking-widest font-sans transition-colors',
              activeFilter === tab
                ? 'text-mauve border-b-2 border-mauve -mb-[25px] pb-[23px]'
                : 'text-obsidian/40 hover:text-obsidian/70',
            ].join(' ')}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-sans text-sm text-obsidian/40">No works to display.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-16">
          {filtered.map((artwork) => (
            <article key={artwork.id} id={artwork.slug} className="group">
              {artwork.imageUrl ? (
                <div className="relative aspect-[4/5] overflow-hidden bg-obsidian/5 mb-4">
                  <Image
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] bg-obsidian/5 mb-4 flex items-end p-4">
                  <span className="font-display italic text-obsidian/20 text-sm">
                    Image coming soon
                  </span>
                </div>
              )}

              <div>
                <h2 className="font-display italic text-lg text-obsidian">{artwork.title}</h2>
                <p className="font-sans text-xs text-obsidian/50 mt-1 leading-relaxed">
                  {[artwork.medium, artwork.dimensions, artwork.year].filter(Boolean).join(' · ')}
                </p>
                {artwork.description && (
                  <p className="font-sans text-sm text-obsidian/60 mt-2 leading-relaxed line-clamp-3">
                    {artwork.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
