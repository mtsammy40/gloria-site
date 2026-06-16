import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb } from './test-db';
import { getSiteSettings, updateSiteSettings } from './settings';
import { siteSettings } from '@/lib/db/schema';
import type { DB } from '@/lib/db';

let db: DB;

beforeAll(async () => {
  const ctx = await createTestDb();
  db = ctx.db;
  await ctx.truncateAll();
  // Seed the single settings row required for these tests
  await db.insert(siteSettings).values({
    homeTagline: 'Art that holds its ground.',
    homeArtistStatement: 'Test statement.',
    mailingBannerHeading: 'Stay Close',
    mailingBannerSubheading: '',
    contactEmail: 'hello@gloriahmutheu.com',
    instagramHandle: '@oriahinteriorart',
    pinterestHandle: 'gloriahmutheu',
    shippingFeeKenyaKes: 500,
    shippingFeeInternationalKes: 3000,
    usdExchangeRate: 130,
  });
});

describe('site_settings content repository', () => {
  it('getSiteSettings returns the seeded row', async () => {
    const settings = await getSiteSettings(db);
    expect(settings.homeTagline).toBe('Art that holds its ground.');
    expect(settings.shippingFeeKenyaKes).toBe(500);
  });

  it('updateSiteSettings persists changes', async () => {
    const updated = await updateSiteSettings(db, {
      homeTagline: 'Updated tagline.',
      shippingFeeKenyaKes: 750,
    });
    expect(updated.homeTagline).toBe('Updated tagline.');
    expect(updated.shippingFeeKenyaKes).toBe(750);

    // Re-read to confirm persistence
    const refetched = await getSiteSettings(db);
    expect(refetched.homeTagline).toBe('Updated tagline.');
  });

  it('usd_exchange_rate is returned as a number', async () => {
    const settings = await getSiteSettings(db);
    expect(typeof settings.usdExchangeRate).toBe('number');
  });
});
