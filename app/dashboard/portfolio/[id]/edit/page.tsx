import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getArtworkById, countFeaturedArtworks } from '@/lib/content/artworks';
import { verifySession } from '@/lib/auth/session';
import { updateArtworkAction } from '@/app/actions/portfolio';
import { ArtworkForm } from '../../artwork-form';

type Props = { params: Promise<{ id: string }> };

export default async function EditArtworkPage({ params }: Props) {
  await verifySession();
  const { id } = await params;
  const [artwork, featuredCount] = await Promise.all([
    getArtworkById(db, id),
    countFeaturedArtworks(db),
  ]);
  if (!artwork) notFound();

  const action = updateArtworkAction.bind(null, id);
  // Cap only blocks unfeatured artworks — if it's already featured, the checkbox stays enabled
  const featuredCapReached = !artwork.featured && featuredCount >= 3;

  return (
    <ArtworkForm
      action={action}
      heading={`Edit — ${artwork.title}`}
      featuredCapReached={featuredCapReached}
      defaultValues={{
        title: artwork.title,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        year: artwork.year,
        description: artwork.description,
        featured: artwork.featured,
        slug: artwork.slug,
        imageUrl: artwork.imageUrl,
      }}
    />
  );
}
