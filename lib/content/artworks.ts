import { and, asc, eq, ne, sql } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { artworks } from '@/lib/db/schema';

export type ArtworkInsert = typeof artworks.$inferInsert;
export type ArtworkRow = typeof artworks.$inferSelect;

export type CreateArtworkInput = Omit<ArtworkInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateArtworkInput = Partial<CreateArtworkInput>;

export async function listArtworks(db: DB): Promise<ArtworkRow[]> {
  return db.select().from(artworks).orderBy(asc(artworks.displayOrder), asc(artworks.createdAt));
}

export async function listFeaturedArtworks(db: DB, limit = 3): Promise<ArtworkRow[]> {
  return db
    .select()
    .from(artworks)
    .where(eq(artworks.featured, true))
    .orderBy(asc(artworks.displayOrder))
    .limit(limit);
}

export async function listDistinctMediums(db: DB): Promise<string[]> {
  const rows = await db
    .selectDistinct({ medium: artworks.medium })
    .from(artworks)
    .orderBy(asc(artworks.medium));
  return rows.map((r) => r.medium);
}

export async function getArtworkBySlug(db: DB, slug: string): Promise<ArtworkRow | null> {
  const [row] = await db.select().from(artworks).where(eq(artworks.slug, slug)).limit(1);
  return row ?? null;
}

export async function getArtworkById(db: DB, id: string): Promise<ArtworkRow | null> {
  const [row] = await db.select().from(artworks).where(eq(artworks.id, id)).limit(1);
  return row ?? null;
}

export async function createArtwork(db: DB, input: CreateArtworkInput): Promise<ArtworkRow> {
  const [row] = await db.insert(artworks).values(input).returning();
  return row;
}

export async function updateArtwork(
  db: DB,
  id: string,
  input: UpdateArtworkInput,
): Promise<ArtworkRow | null> {
  const [row] = await db
    .update(artworks)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(artworks.id, id))
    .returning();
  return row ?? null;
}

export async function deleteArtwork(db: DB, id: string): Promise<boolean> {
  const result = await db.delete(artworks).where(eq(artworks.id, id));
  return (result as unknown as { rowCount?: number })?.rowCount !== 0;
}

export async function reorderArtworks(
  db: DB,
  orderedIds: string[],
): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      db.update(artworks).set({ displayOrder: index, updatedAt: new Date() }).where(eq(artworks.id, id)),
    ),
  );
}

export async function countFeaturedArtworks(db: DB): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(artworks)
    .where(and(eq(artworks.featured, true)));
  return row?.count ?? 0;
}
