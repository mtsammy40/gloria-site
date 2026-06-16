/**
 * Seed script — idempotent, safe to re-run.
 * Creates: one admin user, one site_settings row, sample artworks & products.
 *
 * Usage: npm run db:seed
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from '../lib/db/schema';

const {
  adminUsers,
  artworks,
  products,
  siteSettings,
} = schema;

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const client = postgres(url);
  const db = drizzle(client, { schema });

  // ── Admin user ──────────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@gloriahmutheu.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'change-me';

  const [existingAdmin] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, adminEmail))
    .limit(1);

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await db.insert(adminUsers).values({ email: adminEmail, passwordHash });
    console.log(`✓ Admin user created: ${adminEmail}`);
  } else {
    console.log(`  Admin user already exists: ${adminEmail}`);
  }

  // ── Site settings ───────────────────────────────────────────────────────────
  const [existingSettings] = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);

  if (!existingSettings) {
    await db.insert(siteSettings).values({
      homeTagline: 'Art that holds its ground.',
      homeArtistStatement:
        'Gloriah Mutheu Mwangangi works with acrylics, oils, and found materials, drawing from the landscapes and colour fields of East Africa — abstracted until they are almost feelings.',
      aboutBio:
        'Gloriah is a Nairobi-based visual artist working with acrylics, oil, and found materials. Her work draws from the landscapes, textures, and colour fields of East Africa — abstracted until they are almost feelings.',
      aboutStatementQuote:
        '"I am interested in the moment before a thing is fully named — when a landscape is still just light and weight, when colour is still just feeling. That is where I try to work."',
      contactEmail: 'hello@gloriahmutheu.com',
      instagramHandle: '@oriahinteriorart',
      pinterestHandle: 'gloriahmutheu',
      mailingBannerHeading: 'Stay Close',
      mailingBannerSubheading: 'Beauty finds you when you stay close.',
      shippingFeeKenyaKes: 500,
      shippingFeeInternationalKes: 4500,
      usdExchangeRate: 130,
    });
    console.log('✓ Site settings created');
  } else {
    console.log('  Site settings already exist');
  }

  // ── Sample artworks ─────────────────────────────────────────────────────────
  const sampleArtworks = [
    { title: 'Rift Light', slug: 'rift-light', medium: 'Acrylic', dimensions: '100 × 80 cm', year: 2024, featured: true, displayOrder: 0 },
    { title: 'Afternoon Haze', slug: 'afternoon-haze', medium: 'Oil', dimensions: '60 × 90 cm', year: 2023, featured: true, displayOrder: 1 },
    { title: 'Coast at Low Tide', slug: 'coast-at-low-tide', medium: 'Mixed Media', dimensions: '80 × 100 cm', year: 2023, featured: true, displayOrder: 2 },
    { title: 'Highland Forest I', slug: 'highland-forest-i', medium: 'Acrylic', dimensions: '50 × 50 cm', year: 2022, featured: false, displayOrder: 3 },
    { title: 'Earth Study', slug: 'earth-study', medium: 'Mixed Media', dimensions: '40 × 40 cm', year: 2022, featured: false, displayOrder: 4 },
    { title: 'Red Dust', slug: 'red-dust', medium: 'Oil', dimensions: '70 × 90 cm', year: 2024, featured: false, displayOrder: 5 },
  ];

  for (const data of sampleArtworks) {
    const [existing] = await db
      .select({ id: artworks.id })
      .from(artworks)
      .where(eq(artworks.slug, data.slug))
      .limit(1);

    if (!existing) {
      const [art] = await db.insert(artworks).values(data).returning();

      // Attach a shop product to the first 3 (featured) artworks
      if (data.featured) {
        const isOriginal = data.displayOrder < 2;
        await db.insert(products).values({
          artworkId: art.id,
          type: isOriginal ? 'original' : 'print',
          priceKes: isOriginal ? 120000 : 18000,
          editionSize: isOriginal ? null : 50,
          stockRemaining: isOriginal ? 1 : 50,
          description: isOriginal
            ? `An original one-of-a-kind work on canvas. ${data.dimensions}, ${data.year}.`
            : `Limited edition giclée print on 310gsm cotton rag. Edition of 50. ${data.year}.`,
        });
      }
    }
  }
  console.log('✓ Sample artworks & products seeded');

  await client.end();
  console.log('\nSeed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
