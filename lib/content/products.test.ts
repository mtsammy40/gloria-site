import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb } from './test-db';
import { createArtwork } from './artworks';
import {
  createProduct,
  listAvailableProducts,
  getProductById,
  updateProduct,
  isProductAvailable,
} from './products';
import type { DB } from '@/lib/db';

let db: DB;

beforeAll(async () => {
  const ctx = await createTestDb();
  db = ctx.db;
  await ctx.truncateAll();
});

describe('products content repository', () => {
  it('creates a product and retrieves it with its artwork', async () => {
    const art = await createArtwork(db, { title: 'Tide', slug: 'tide', medium: 'Oil' });
    const product = await createProduct(db, {
      artworkId: art.id,
      type: 'original',
      priceKes: 120000,
      stockRemaining: 1,
    });

    const found = await getProductById(db, product.id);
    expect(found?.priceKes).toBe(120000);
    expect(found?.artwork.title).toBe('Tide');
  });

  it('isProductAvailable returns false when manually marked sold', async () => {
    const art = await createArtwork(db, { title: 'Sold', slug: 'sold-art', medium: 'Acrylic' });
    const product = await createProduct(db, {
      artworkId: art.id,
      type: 'original',
      priceKes: 80000,
      stockRemaining: 1,
      manuallyMarkedSold: true,
    });
    expect(isProductAvailable(product)).toBe(false);
  });

  it('isProductAvailable returns false when stock is zero', async () => {
    const art = await createArtwork(db, { title: 'Exhausted', slug: 'exhausted', medium: 'Oil' });
    const product = await createProduct(db, {
      artworkId: art.id,
      type: 'print',
      priceKes: 15000,
      editionSize: 50,
      stockRemaining: 0,
    });
    expect(isProductAvailable(product)).toBe(false);
  });

  it('isProductAvailable returns true when stock > 0 and not manually sold', async () => {
    const art = await createArtwork(db, { title: 'In Stock', slug: 'in-stock', medium: 'Mixed Media' });
    const product = await createProduct(db, {
      artworkId: art.id,
      type: 'print',
      priceKes: 12000,
      editionSize: 50,
      stockRemaining: 10,
    });
    expect(isProductAvailable(product)).toBe(true);
  });

  it('listAvailableProducts excludes sold-out and manually-sold items', async () => {
    const art1 = await createArtwork(db, { title: 'P1', slug: 'p1', medium: 'Oil' });
    const art2 = await createArtwork(db, { title: 'P2', slug: 'p2', medium: 'Oil' });

    await createProduct(db, { artworkId: art1.id, type: 'original', priceKes: 1, stockRemaining: 1, manuallyMarkedSold: true });
    await createProduct(db, { artworkId: art2.id, type: 'original', priceKes: 1, stockRemaining: 0 });

    const available = await listAvailableProducts(db);
    expect(available.every((p) => !p.manuallyMarkedSold)).toBe(true);
  });

  it('updates a product price', async () => {
    const art = await createArtwork(db, { title: 'Price Test', slug: 'price-test', medium: 'Oil' });
    const product = await createProduct(db, {
      artworkId: art.id,
      type: 'original',
      priceKes: 50000,
      stockRemaining: 1,
    });

    const updated = await updateProduct(db, product.id, { priceKes: 60000 });
    expect(updated?.priceKes).toBe(60000);
  });
});
