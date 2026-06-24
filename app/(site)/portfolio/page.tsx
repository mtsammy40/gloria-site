import { db } from '@/lib/db';
import { listArtworks, listDistinctMediums } from '@/lib/content/artworks';
import { PortfolioGrid } from '@/components/portfolio-grid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio — Gloriah Mutheu Mwangangi',
  description: 'Original paintings and limited prints by Gloriah Mutheu Mwangangi.',
};

export default async function PortfolioPage() {
  let allArtworks: Awaited<ReturnType<typeof listArtworks>> = [];
  let mediums: string[] = [];

  try {
    [allArtworks, mediums] = await Promise.all([listArtworks(db), listDistinctMediums(db)]);
  } catch {
    // DB not available at build time — render empty state
  }

  return (
    <section className="bg-ivory min-h-screen px-6 lg:px-10 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 lg:mb-16">
          <h1 className="font-display font-semibold text-4xl lg:text-5xl text-obsidian">Portfolio</h1>
          <p className="font-sans text-sm text-obsidian/50 mt-3">
            {allArtworks.length > 0
              ? `${allArtworks.length} work${allArtworks.length !== 1 ? 's' : ''}`
              : 'New work coming soon.'}
          </p>
        </header>

        {allArtworks.length === 0 ? (
          <div className="py-24 text-center border border-obsidian/10">
            <p className="font-sans text-sm text-obsidian/40">
              No artworks yet — check back soon.
            </p>
          </div>
        ) : (
          <PortfolioGrid artworks={allArtworks} mediums={mediums} />
        )}
      </div>
    </section>
  );
}
