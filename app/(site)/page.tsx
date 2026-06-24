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

  // Split the tagline so the last word gets the italic mauve accent
  const taglineWords = tagline.split(' ');
  const taglineAccent = taglineWords.pop() ?? '';
  const taglineBody = taglineWords.join(' ');

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="h-[100svh] min-h-[600px] overflow-hidden flex">
        {/* Left text panel */}
        <div className="relative flex flex-col justify-between bg-obsidian w-full lg:w-[54%] shrink-0 px-6 lg:px-10 pt-10 pb-14 lg:pt-16 lg:pb-20 overflow-hidden">
          {/* Subtle sage atmosphere on mobile (right panel hidden) */}
          <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-obsidian to-sage-deep/10 pointer-events-none lg:hidden" />

          {/* Eyebrow */}
          <p className="relative font-sans text-[10px] uppercase tracking-[0.22em] text-ivory/30">
            <span className="text-sage/70 mr-2">01</span>— Home
          </p>

          {/* Headline + statement */}
          <div className="relative">
            <h1
              className="font-display font-bold text-ivory leading-none mb-8"
              style={{ fontSize: 'clamp(54px, 8.5vw, 112px)' }}
            >
              {taglineBody}{' '}
              <em className="text-mauve">{taglineAccent}</em>
            </h1>

            <div className="border-t border-ivory/[0.08] pt-6 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-10">
              <p className="font-sans text-ivory/55 text-sm leading-relaxed max-w-[340px]">
                {artistStatement}
              </p>
              <Link
                href="#selected-works"
                className="shrink-0 flex items-center gap-3 font-sans text-[9px] uppercase tracking-[0.22em] text-ivory/35 hover:text-sage transition-colors"
              >
                <span className="w-8 h-px bg-current inline-block shrink-0" />
                Scroll to enter the studio
              </Link>
            </div>
          </div>
        </div>

        {/* Right visual panel — sage, hidden on mobile */}
        <div className="hidden lg:block lg:flex-1 relative bg-sage-deep overflow-hidden">
          {heroVideoUrl ? (
            <video
              src={heroVideoUrl}
              poster={heroPosterUrl ?? undefined}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-sage/15 via-sage-deep to-obsidian/50" />
          )}

          {/* Studio film label */}
          <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-ivory/20 flex items-center justify-center">
              <svg
                width="9"
                height="11"
                viewBox="0 0 9 11"
                fill="none"
                aria-hidden="true"
                className="text-ivory/50 ml-0.5"
              >
                <path d="M0 0L9 5.5L0 11V0Z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-sans text-[9px] uppercase tracking-[0.22em] text-ivory/35">
              Studio Film · Loop
            </span>
          </div>
        </div>
      </section>

      {/* ── Selected Works ───────────────────────────────────────────────── */}
      <section id="selected-works" className="bg-ivory px-6 lg:px-10 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-10 lg:mb-14">
            <h2 className="font-display font-semibold text-3xl lg:text-4xl text-obsidian">
              Selected Works
            </h2>
            <Link
              href="/portfolio"
              className="font-sans text-xs uppercase tracking-widest text-obsidian/50 hover:text-mauve border-b border-obsidian/20 hover:border-mauve pb-px transition-colors"
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
