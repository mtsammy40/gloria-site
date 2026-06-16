'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductWithArtwork } from '@/lib/content/products';
import { isProductAvailable } from '@/lib/content/products';

type Props = {
  originals: ProductWithArtwork[];
  prints: ProductWithArtwork[];
  usdRate: number;
};

function usdRef(priceKes: number, rate: number): string {
  const usd = Math.round(priceKes / rate / 10) * 10;
  return `~$${usd.toLocaleString()}`;
}

function ProductCard({
  product,
  usdRate,
  cols,
}: {
  product: ProductWithArtwork;
  usdRate: number;
  cols: 2 | 4;
}) {
  const available = isProductAvailable(product);
  const artwork = product.artwork;
  const aspectClass = cols === 2 ? 'aspect-[3/4]' : 'aspect-square';

  return (
    <article className="group">
      <Link href={`/shop/${product.id}`} className="block">
        <div className={`relative ${aspectClass} overflow-hidden bg-obsidian/5 mb-4`}>
          {artwork.imageUrl ? (
            <Image
              src={artwork.imageUrl}
              alt={artwork.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes={
                cols === 2
                  ? '(max-width: 640px) 100vw, 50vw'
                  : '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw'
              }
            />
          ) : (
            <div className="absolute inset-0 flex items-end p-4">
              <span className="font-display italic text-obsidian/20 text-xs">
                Image coming soon
              </span>
            </div>
          )}

          {!available && (
            <div className="absolute inset-0 bg-ivory/70 flex items-center justify-center">
              <span className="font-sans text-xs uppercase tracking-widest text-obsidian/50">
                Sold
              </span>
            </div>
          )}

          {product.type === 'print' && product.editionSize && (
            <div className="absolute top-3 left-3">
              <span className="font-sans text-xs text-obsidian/60 bg-ivory/90 px-2 py-1">
                Ed. {product.stockRemaining}/{product.editionSize}
              </span>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display italic text-base lg:text-lg text-obsidian group-hover:text-mauve transition-colors">
            {artwork.title}
          </h3>
          <p className="font-sans text-xs text-obsidian/50 mt-1">
            {[artwork.medium, artwork.dimensions, artwork.year].filter(Boolean).join(' · ')}
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-sans text-sm text-obsidian font-medium">
              KES {product.priceKes.toLocaleString()}
            </span>
            <span className="font-sans text-xs text-obsidian/40">
              {usdRef(product.priceKes, usdRate)}
            </span>
          </div>
        </div>
      </Link>

      {available && (
        <Link
          href={`/shop/${product.id}`}
          className="mt-3 inline-block font-sans text-xs uppercase tracking-widest text-obsidian/50 hover:text-obsidian border-b border-obsidian/20 hover:border-obsidian pb-px transition-colors"
        >
          View details →
        </Link>
      )}
    </article>
  );
}

export function ShopTabs({ originals, prints, usdRate }: Props) {
  const [tab, setTab] = useState<'originals' | 'prints'>('originals');

  const tabs = [
    { key: 'originals' as const, label: 'Original Works', count: originals.length },
    { key: 'prints' as const, label: 'Limited Prints', count: prints.length },
  ];

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-1 mb-12 lg:mb-16 border-b border-obsidian/10 pb-6">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={[
              'px-4 py-2 text-xs uppercase tracking-widest font-sans transition-colors',
              tab === key
                ? 'text-obsidian border-b-2 border-obsidian -mb-[25px] pb-[23px]'
                : 'text-obsidian/40 hover:text-obsidian/70',
            ].join(' ')}
          >
            {label}{' '}
            <span className="ml-1 text-[10px] text-obsidian/30">({count})</span>
          </button>
        ))}
      </div>

      {/* Originals — 2-col */}
      {tab === 'originals' && (
        <>
          {originals.length === 0 ? (
            <EmptyState label="No original works listed yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-14">
              {originals.map((p) => (
                <ProductCard key={p.id} product={p} usdRate={usdRate} cols={2} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Prints — 4-col */}
      {tab === 'prints' && (
        <>
          {prints.length === 0 ? (
            <EmptyState label="No limited prints available yet." />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6 lg:gap-y-14">
              {prints.map((p) => (
                <ProductCard key={p.id} product={p} usdRate={usdRate} cols={4} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-24 text-center border border-obsidian/10">
      <p className="font-sans text-sm text-obsidian/40">{label}</p>
    </div>
  );
}
