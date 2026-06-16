import { and, asc, eq } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { products, artworks } from '@/lib/db/schema';

export type ProductInsert = typeof products.$inferInsert;
export type ProductRow = typeof products.$inferSelect;
export type ProductWithArtwork = ProductRow & { artwork: typeof artworks.$inferSelect };

export type CreateProductInput = Omit<ProductInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;

function availabilityFilter() {
  return and(eq(products.manuallyMarkedSold, false));
}

export async function listProducts(db: DB): Promise<ProductWithArtwork[]> {
  return db.query.products.findMany({
    with: { artwork: true },
    orderBy: [asc(products.createdAt)],
  });
}

export async function listAvailableProducts(db: DB): Promise<ProductWithArtwork[]> {
  return db.query.products.findMany({
    with: { artwork: true },
    where: availabilityFilter(),
    orderBy: [asc(products.createdAt)],
  });
}

export async function getProductById(db: DB, id: string): Promise<ProductWithArtwork | null> {
  const row = await db.query.products.findFirst({
    with: { artwork: true },
    where: eq(products.id, id),
  });
  return row ?? null;
}

export async function listProductsByArtworkSlug(
  db: DB,
  slug: string,
): Promise<ProductWithArtwork[]> {
  const rows = await db
    .select({ product: products, artwork: artworks })
    .from(products)
    .innerJoin(artworks, eq(products.artworkId, artworks.id))
    .where(eq(artworks.slug, slug))
    .orderBy(asc(products.createdAt));
  return rows.map(({ product, artwork }) => ({ ...product, artwork }));
}

export async function createProduct(db: DB, input: CreateProductInput): Promise<ProductRow> {
  const [row] = await db.insert(products).values(input).returning();
  return row;
}

export async function updateProduct(
  db: DB,
  id: string,
  input: UpdateProductInput,
): Promise<ProductRow | null> {
  const [row] = await db
    .update(products)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return row ?? null;
}

export async function deleteProduct(db: DB, id: string): Promise<boolean> {
  const result = await db.delete(products).where(eq(products.id, id));
  return (result as unknown as { rowCount?: number })?.rowCount !== 0;
}

export function isProductAvailable(product: ProductRow): boolean {
  return !product.manuallyMarkedSold && product.stockRemaining > 0;
}
