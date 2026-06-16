import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getProductById, isProductAvailable } from '@/lib/content/products';
import { getSiteSettings } from '@/lib/content/settings';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProductById(db, id);
    if (!product) return {};
    return {
      title: `${product.artwork.title} — Shop — Gloriah Mutheu Mwangangi`,
      description: product.description ?? `${product.artwork.title} by Gloriah Mutheu Mwangangi.`,
    };
  } catch {
    return {};
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  let product: Awaited<ReturnType<typeof getProductById>> = null;
  let usdRate = 130;

  try {
    const [p, settings] = await Promise.all([getProductById(db, id), getSiteSettings(db)]);
    product = p;
    usdRate = settings.usdExchangeRate;
  } catch {
    // DB error
  }

  if (!product) notFound();

  const artwork = product.artwork;
  const available = isProductAvailable(product);
  const usdRef = Math.round(product.priceKes / usdRate / 10) * 10;
  const isPrint = product.type === 'print';

  return (
    <section className="bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        {/* Back */}
        <Link
          href="/shop"
          className="inline-block font-sans text-xs uppercase tracking-widest text-obsidian/40 hover:text-obsidian mb-10 transition-colors"
        >
          ← Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <div className="relative aspect-[4/5] bg-obsidian/5">
            {artwork.imageUrl ? (
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-end p-6">
                <span className="font-display italic text-obsidian/20 text-sm">
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
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-4">
              {isPrint ? 'Limited Print' : 'Original Work'}
            </p>
            <h1 className="font-display italic text-3xl lg:text-4xl text-obsidian mb-3">
              {artwork.title}
            </h1>

            <p className="font-sans text-sm text-obsidian/50 mb-6 leading-relaxed">
              {[artwork.medium, artwork.dimensions, artwork.year].filter(Boolean).join(' · ')}
            </p>

            {(artwork.description || product.description) && (
              <p className="font-sans text-base text-obsidian/70 leading-relaxed mb-8 max-w-md">
                {product.description ?? artwork.description}
              </p>
            )}

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-obsidian/10">
              <div className="flex items-baseline gap-4">
                <span className="font-sans text-2xl text-obsidian">
                  KES {product.priceKes.toLocaleString()}
                </span>
                <span className="font-sans text-sm text-obsidian/40">~${usdRef.toLocaleString()}</span>
              </div>
              {isPrint && product.editionSize && (
                <p className="font-sans text-xs text-obsidian/40 mt-2">
                  Edition of {product.editionSize} &mdash; {product.stockRemaining} remaining
                </p>
              )}
            </div>

            {/* CTA */}
            {available ? (
              /* Placeholder — wired up fully in Cart module (#8) */
              <button
                type="button"
                data-product-id={product.id}
                className="add-to-cart w-full sm:w-auto bg-obsidian text-ivory font-sans text-xs uppercase tracking-widest px-10 py-4 hover:bg-mauve transition-colors"
              >
                Add to Cart
              </button>
            ) : (
              <p className="font-sans text-sm text-obsidian/40 uppercase tracking-widest">
                This work has found a home.
              </p>
            )}

            {/* Shipping note */}
            <div className="mt-8 pt-8 border-t border-obsidian/10">
              <p className="font-sans text-xs uppercase tracking-widest text-obsidian/40 mb-3">
                Shipping
              </p>
              {isPrint ? (
                <div className="space-y-1">
                  <p className="font-sans text-sm text-obsidian/60">
                    Giclée on 310gsm cotton rag, professionally rolled and shipped.
                  </p>
                  <p className="font-sans text-sm text-obsidian/60">
                    Kenya: 3–5 working days · International: 7–14 working days
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-sans text-sm text-obsidian/60">
                    Stretched canvas, carefully packed with corner protectors.
                  </p>
                  <p className="font-sans text-sm text-obsidian/60">
                    Kenya: 3–5 working days · International: 7–14 working days
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
