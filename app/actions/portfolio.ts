'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import {
  createArtwork,
  updateArtwork,
  deleteArtwork,
  reorderArtworks,
  countFeaturedArtworks,
} from '@/lib/content/artworks';
import { uploadImage, UploadError } from '@/lib/blob/upload';
import { verifySession } from '@/lib/auth/session';

export type ArtworkFormState = { type: 'idle' } | { type: 'error'; message: string };

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createArtworkAction(
  _prev: ArtworkFormState,
  formData: FormData,
): Promise<ArtworkFormState> {
  await verifySession();

  const title = formData.get('title')?.toString().trim() ?? '';
  const medium = formData.get('medium')?.toString().trim() ?? '';
  const dimensions = formData.get('dimensions')?.toString().trim() || null;
  const yearRaw = formData.get('year')?.toString().trim();
  const year = yearRaw ? parseInt(yearRaw, 10) : null;
  const description = formData.get('description')?.toString().trim() || null;
  const featured = formData.get('featured') === 'on';
  const customSlug = formData.get('slug')?.toString().trim();
  const imageFile = formData.get('image') as File | null;

  if (!title) return { type: 'error', message: 'Title is required.' };
  if (!medium) return { type: 'error', message: 'Medium is required.' };

  if (featured) {
    const current = await countFeaturedArtworks(db);
    if (current >= 3) {
      return {
        type: 'error',
        message: 'Only 3 artworks can be featured at once. Unfeature another first.',
      };
    }
  }

  let imageUrl: string | undefined;
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadImage(imageFile, 'artworks');
    } catch (err) {
      return {
        type: 'error',
        message: err instanceof UploadError ? err.message : 'Image upload failed.',
      };
    }
  }

  const slug = customSlug || slugify(title) || `artwork-${Date.now()}`;

  try {
    await createArtwork(db, {
      title,
      slug,
      medium,
      dimensions,
      year: year && !isNaN(year) ? year : null,
      description,
      featured,
      displayOrder: 0,
      imageUrl: imageUrl ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return { type: 'error', message: `Slug "${slug}" is already in use. Choose a different title or slug.` };
    }
    return { type: 'error', message: 'Failed to save artwork.' };
  }

  revalidatePath('/portfolio');
  revalidatePath('/');
  redirect('/dashboard/portfolio');
}

export async function updateArtworkAction(
  id: string,
  _prev: ArtworkFormState,
  formData: FormData,
): Promise<ArtworkFormState> {
  await verifySession();

  const title = formData.get('title')?.toString().trim() ?? '';
  const medium = formData.get('medium')?.toString().trim() ?? '';
  const dimensions = formData.get('dimensions')?.toString().trim() || null;
  const yearRaw = formData.get('year')?.toString().trim();
  const year = yearRaw ? parseInt(yearRaw, 10) : null;
  const description = formData.get('description')?.toString().trim() || null;
  const featured = formData.get('featured') === 'on';
  const imageFile = formData.get('image') as File | null;

  if (!title) return { type: 'error', message: 'Title is required.' };
  if (!medium) return { type: 'error', message: 'Medium is required.' };

  const patch: Record<string, unknown> = {
    title,
    medium,
    dimensions,
    year: year && !isNaN(year) ? year : null,
    description,
    featured,
  };

  if (imageFile && imageFile.size > 0) {
    try {
      patch.imageUrl = await uploadImage(imageFile, 'artworks');
    } catch (err) {
      return {
        type: 'error',
        message: err instanceof UploadError ? err.message : 'Image upload failed.',
      };
    }
  }

  await updateArtwork(db, id, patch);
  revalidatePath('/portfolio');
  revalidatePath('/');
  redirect('/dashboard/portfolio');
}

export async function deleteArtworkAction(id: string): Promise<void> {
  await verifySession();
  await deleteArtwork(db, id);
  revalidatePath('/portfolio');
  revalidatePath('/');
  redirect('/dashboard/portfolio');
}

export async function reorderArtworksAction(orderedIds: string[]): Promise<void> {
  await verifySession();
  await reorderArtworks(db, orderedIds);
  revalidatePath('/portfolio');
}
