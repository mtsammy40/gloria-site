import Link from 'next/link';
import { db } from '@/lib/db';
import { listArtworks } from '@/lib/content/artworks';
import { verifySession } from '@/lib/auth/session';
import { deleteArtworkAction, reorderArtworksAction } from '@/app/actions/portfolio';
import { ArtworkTable } from './artwork-table';

export default async function PortfolioDashboardPage() {
  await verifySession();
  const artworks = await listArtworks(db);
  const featuredCount = artworks.filter((a) => a.featured).length;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display italic text-3xl text-obsidian">Portfolio</h1>
          <p className="font-sans text-xs text-obsidian/40 mt-1">
            {artworks.length} artwork{artworks.length !== 1 ? 's' : ''} · {featuredCount}/3 featured
          </p>
        </div>
        <Link
          href="/dashboard/portfolio/new"
          className="bg-obsidian text-ivory font-sans text-xs uppercase tracking-widest px-5 py-3 hover:bg-mauve transition-colors"
        >
          + Add artwork
        </Link>
      </div>

      {artworks.length === 0 ? (
        <div className="border border-obsidian/10 py-16 text-center rounded bg-white">
          <p className="font-sans text-sm text-obsidian/40">No artworks yet.</p>
          <Link
            href="/dashboard/portfolio/new"
            className="font-sans text-sm text-mauve hover:underline mt-2 inline-block"
          >
            Add the first one →
          </Link>
        </div>
      ) : (
        <ArtworkTable
          initialArtworks={artworks}
          deleteAction={deleteArtworkAction}
          reorderAction={reorderArtworksAction}
        />
      )}
    </div>
  );
}
