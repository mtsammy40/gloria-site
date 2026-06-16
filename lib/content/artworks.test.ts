import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb } from './test-db';
import {
  createArtwork,
  listArtworks,
  listFeaturedArtworks,
  listDistinctMediums,
  getArtworkBySlug,
  updateArtwork,
  deleteArtwork,
  reorderArtworks,
} from './artworks';
import type { DB } from '@/lib/db';

let db: DB;

beforeAll(async () => {
  const ctx = await createTestDb();
  db = ctx.db;
  await ctx.truncateAll();
});

describe('artworks content repository', () => {
  it('creates and retrieves an artwork by slug', async () => {
    const art = await createArtwork(db, {
      title: 'Forest Light',
      slug: 'forest-light',
      medium: 'Acrylic',
      dimensions: '60 × 80 cm',
      year: 2023,
      featured: false,
      displayOrder: 0,
    });
    expect(art.id).toBeTruthy();

    const found = await getArtworkBySlug(db, 'forest-light');
    expect(found?.title).toBe('Forest Light');
  });

  it('lists artworks ordered by displayOrder then createdAt', async () => {
    await createArtwork(db, { title: 'B', slug: 'b', medium: 'Oil', displayOrder: 2 });
    await createArtwork(db, { title: 'A', slug: 'a', medium: 'Oil', displayOrder: 1 });

    const list = await listArtworks(db);
    const titles = list.map((a) => a.title);
    const idxA = titles.indexOf('A');
    const idxB = titles.indexOf('B');
    expect(idxA).toBeLessThan(idxB);
  });

  it('lists featured artworks only', async () => {
    await createArtwork(db, { title: 'Featured', slug: 'featured-1', medium: 'Mixed Media', featured: true, displayOrder: 0 });
    await createArtwork(db, { title: 'Not featured', slug: 'not-featured', medium: 'Oil', featured: false, displayOrder: 1 });

    const featured = await listFeaturedArtworks(db);
    expect(featured.every((a) => a.featured)).toBe(true);
    expect(featured.some((a) => a.title === 'Featured')).toBe(true);
  });

  it('respects the featured limit', async () => {
    const featured = await listFeaturedArtworks(db, 1);
    expect(featured.length).toBeLessThanOrEqual(1);
  });

  it('returns distinct medium values', async () => {
    const mediums = await listDistinctMediums(db);
    expect(mediums).toContain('Acrylic');
    expect(mediums).toContain('Oil');
    expect(mediums).toContain('Mixed Media');
    // no duplicates
    expect(new Set(mediums).size).toBe(mediums.length);
  });

  it('updates an artwork', async () => {
    const art = await createArtwork(db, { title: 'Old Title', slug: 'update-me', medium: 'Oil' });
    const updated = await updateArtwork(db, art.id, { title: 'New Title' });
    expect(updated?.title).toBe('New Title');
    expect(updated?.medium).toBe('Oil');
  });

  it('deletes an artwork', async () => {
    const art = await createArtwork(db, { title: 'To Delete', slug: 'delete-me', medium: 'Oil' });
    const ok = await deleteArtwork(db, art.id);
    expect(ok).toBe(true);
    const found = await getArtworkBySlug(db, 'delete-me');
    expect(found).toBeNull();
  });

  it('reorders artworks', async () => {
    const a = await createArtwork(db, { title: 'Reorder A', slug: 'reorder-a', medium: 'Oil', displayOrder: 99 });
    const b = await createArtwork(db, { title: 'Reorder B', slug: 'reorder-b', medium: 'Oil', displayOrder: 98 });

    await reorderArtworks(db, [b.id, a.id]);

    const list = await listArtworks(db);
    const aRow = list.find((x) => x.id === a.id)!;
    const bRow = list.find((x) => x.id === b.id)!;
    expect(bRow.displayOrder).toBe(0);
    expect(aRow.displayOrder).toBe(1);
  });

  it('returns null for unknown slug', async () => {
    const found = await getArtworkBySlug(db, 'no-such-slug');
    expect(found).toBeNull();
  });
});
