import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getArtworkById } from '@/lib/content/artworks';
import { verifySession } from '@/lib/auth/session';
import { updateArtworkAction } from '@/app/actions/portfolio';
import { ArtworkForm } from '../../artwork-form';

type Props = { params: Promise<{ id: string }> };

export default async function EditArtworkPage({ params }: Props) {
  await verifySession();
  const { id } = await params;
  const artwork = await getArtworkById(db, id);
  if (!artwork) notFound();

  const action = updateArtworkAction.bind(null, id);

  return (
    <ArtworkForm
      action={action}
      heading={`Edit — ${artwork.title}`}
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
