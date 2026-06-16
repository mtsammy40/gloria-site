import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { listArtworks } from '@/lib/content/artworks';
import { getProductById } from '@/lib/content/products';
import { verifySession } from '@/lib/auth/session';
import { updateProductAction } from '@/app/actions/products';
import { ProductForm } from '../../product-form';

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  await verifySession();
  const { id } = await params;
  const [product, artworks] = await Promise.all([getProductById(db, id), listArtworks(db)]);
  if (!product) notFound();

  const action = updateProductAction.bind(null, id);

  return (
    <ProductForm
      action={action}
      artworks={artworks}
      heading={`Edit — ${product.artwork.title} (${product.type})`}
      isEdit
      defaultValues={{
        artworkId: product.artworkId,
        type: product.type,
        priceKes: product.priceKes,
        stockRemaining: product.stockRemaining,
        editionSize: product.editionSize,
        description: product.description,
        manuallyMarkedSold: product.manuallyMarkedSold,
      }}
    />
  );
}
