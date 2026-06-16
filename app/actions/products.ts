'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createProduct, updateProduct, deleteProduct } from '@/lib/content/products';
import { verifySession } from '@/lib/auth/session';

export type ProductFormState = { type: 'idle' } | { type: 'error'; message: string };

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await verifySession();

  const artworkId = formData.get('artworkId')?.toString().trim() ?? '';
  const type = formData.get('type')?.toString() as 'original' | 'print';
  const priceKes = parseInt(formData.get('priceKes')?.toString() ?? '0', 10);
  const stockRemaining = parseInt(formData.get('stockRemaining')?.toString() ?? '0', 10);
  const editionSize = parseInt(formData.get('editionSize')?.toString() ?? '0', 10) || null;
  const description = formData.get('description')?.toString().trim() || null;

  if (!artworkId) return { type: 'error', message: 'Artwork is required.' };
  if (!['original', 'print'].includes(type)) return { type: 'error', message: 'Invalid product type.' };
  if (isNaN(priceKes) || priceKes < 0) return { type: 'error', message: 'Price must be a positive number.' };
  if (isNaN(stockRemaining) || stockRemaining < 0) return { type: 'error', message: 'Stock must be 0 or more.' };

  try {
    await createProduct(db, {
      artworkId,
      type,
      priceKes,
      stockRemaining,
      editionSize,
      description,
      manuallyMarkedSold: false,
    });
  } catch (err) {
    return { type: 'error', message: 'Failed to create product.' };
  }

  revalidatePath('/shop');
  redirect('/dashboard/shop');
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await verifySession();

  const priceKes = parseInt(formData.get('priceKes')?.toString() ?? '0', 10);
  const stockRemaining = parseInt(formData.get('stockRemaining')?.toString() ?? '0', 10);
  const editionSize = parseInt(formData.get('editionSize')?.toString() ?? '0', 10) || null;
  const description = formData.get('description')?.toString().trim() || null;
  const manuallyMarkedSold = formData.get('manuallyMarkedSold') === 'on';

  if (isNaN(priceKes) || priceKes < 0) return { type: 'error', message: 'Price must be a positive number.' };
  if (isNaN(stockRemaining) || stockRemaining < 0) return { type: 'error', message: 'Stock must be 0 or more.' };

  await updateProduct(db, id, { priceKes, stockRemaining, editionSize, description, manuallyMarkedSold });
  revalidatePath('/shop');
  redirect('/dashboard/shop');
}

export async function deleteProductAction(id: string): Promise<void> {
  await verifySession();
  await deleteProduct(db, id);
  revalidatePath('/shop');
  redirect('/dashboard/shop');
}
