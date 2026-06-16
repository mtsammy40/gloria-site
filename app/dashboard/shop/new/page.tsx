import { db } from '@/lib/db';
import { listArtworks } from '@/lib/content/artworks';
import { verifySession } from '@/lib/auth/session';
import { createProductAction } from '@/app/actions/products';
import { ProductForm } from '../product-form';

export default async function NewProductPage() {
  await verifySession();
  const artworks = await listArtworks(db);
  return <ProductForm action={createProductAction} artworks={artworks} heading="Add product" />;
}
