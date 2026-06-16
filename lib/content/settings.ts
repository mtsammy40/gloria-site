import { eq } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';

export type SiteSettingsRow = typeof siteSettings.$inferSelect;
export type UpdateSiteSettingsInput = Partial<Omit<SiteSettingsRow, 'id' | 'updatedAt'>>;

// Fetch the single settings row; throws if not yet seeded.
export async function getSiteSettings(db: DB): Promise<SiteSettingsRow> {
  const [row] = await db.select().from(siteSettings).limit(1);
  if (!row) throw new Error('site_settings not seeded — run npm run db:seed');
  return row;
}

export async function updateSiteSettings(
  db: DB,
  input: UpdateSiteSettingsInput,
): Promise<SiteSettingsRow> {
  const [existing] = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
  if (!existing) throw new Error('site_settings not seeded — run npm run db:seed');

  const [row] = await db
    .update(siteSettings)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(siteSettings.id, existing.id))
    .returning();
  return row;
}
