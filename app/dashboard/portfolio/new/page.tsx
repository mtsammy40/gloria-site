import { db } from '@/lib/db';
import { countFeaturedArtworks } from '@/lib/content/artworks';
import { verifySession } from '@/lib/auth/session';
import { createArtworkAction } from '@/app/actions/portfolio';
import { ArtworkForm } from '../artwork-form';

export default async function NewArtworkPage() {
  await verifySession();
  const featuredCount = await countFeaturedArtworks(db);
  return (
    <ArtworkForm
      action={createArtworkAction}
      heading="Add artwork"
      featuredCapReached={featuredCount >= 3}
    />
  );
}
