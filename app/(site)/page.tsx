import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { getSiteSettings } from '@/lib/content/settings';
import { listFeaturedArtworks } from '@/lib/content/artworks';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gloriah Mutheu Mwangangi — Artist',
  description:
    'Nairobi-based visual artist — original paintings, limited prints, and bespoke interior art.',
};

export default async function HomePage() {
  let heroVideoUrl: string | null = null;
  let heroPosterUrl: string | null = null;
  let tagline = 'Art that holds its ground.';
  let artistStatement =
    'I paint because the world needs more slowness. Each piece is an act of attention — to colour, to surface, to what stays when everything else has moved on.';

  let featuredArtworks: Awaited<ReturnType<typeof listFeaturedArtworks>> = [];

  try {
    const [settings, artworks] = await Promise.all([
      getSiteSettings(db),
      listFeaturedArtworks(db, 3),
    ]);
    heroVideoUrl = settings.heroVideoUrl ?? null;
    heroPosterUrl = settings.heroPosterUrl ?? null;
    if (settings.homeTagline) tagline = settings.homeTagline;
    if (settings.homeArtistStatement) artistStatement = settings.homeArtistStatement;
    featuredArtworks = artworks;
  } catch {
    // DB not seeded yet — render with defaults
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative h-[100svh] min-h-[600px] bg-obsidian overflow-hidden">
        {heroVideoUrl ? (
          <video
            src={heroVideoUrl}
            poster={heroPosterUrl ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : (
          /* Placeholder when no hero video is configured */
          <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-obsidian/90 to-mauve/20" />
        )}

        {/* Gradient veil at bottom for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />

        {/* Tagline + statement */}
        <div className="absolute inset-x-0 bottom-0 px-6 lg:px-10 pb-14 lg:pb-20 max-w-7xl mx-auto">
          <h1
            className="font-display italic text-ivory leading-none mb-6"
            style={{ fontSize: 'clamp(48px, 7vw, 88px)' }}
          >
            {tagline}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-16">
            <p className="font-sans italic text-ivory/70 text-base lg:text-lg leading-relaxed max-w-md">
              {artistStatement}
            </p>
            <Link
              href="/about"
              className="shrink-0 font-sans text-xs uppercase tracking-widest text-ivory/60 hover:text-ivory border-b border-ivory/30 hover:border-ivory pb-px transition-colors"
            >
              About Gloriah →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Selected Works ───────────────────────────────────────────────── */}
      <section className="bg-ivory px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-10 lg:mb-14">
            <h2 className="font-display italic text-3xl lg:text-4xl text-obsidian">
              Selected Works
            </h2>
            <Link
              href="/portfolio"
              className="font-sans text-xs uppercase tracking-widest text-obsidian/50 hover:text-obsidian border-b border-obsidian/20 hover:border-obsidian pb-px transition-colors"
            >
              View Portfolio →
            </Link>
          </div>

          {featuredArtworks.length === 0 ? (
            <div className="border border-obsidian/10 py-20 text-center">
              <p className="font-sans text-sm text-obsidian/40">
                No featured works yet — artworks can be featured from the dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredArtworks.map((artwork) => (
                <article key={artwork.id} className="group">
                  <Link href={`/portfolio#${artwork.slug}`} className="block">
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
                      <h3 className="font-display italic text-lg text-obsidian group-hover:text-mauve transition-colors">
                        {artwork.title}
                      </h3>
                      <p className="font-sans text-xs text-obsidian/50 mt-1 leading-relaxed">
                        {[artwork.medium, artwork.dimensions, artwork.year]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
