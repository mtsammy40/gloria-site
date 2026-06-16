/**
 * Test-database helper.
 *
 * Connects to the TEST_DATABASE_URL database (gloria_test in docker-compose),
 * runs migrations if they haven't been applied yet, then returns a `db`
 * instance and a `truncateAll()` helper that wipes every application table so
 * each test suite starts from a clean state.
 *
 * The migrations track state in the TEST database independently from the dev
 * database, so the two never interfere.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import path from 'path';
import * as schema from '@/lib/db/schema';

// Tables to truncate (order respects FK constraints: children before parents)
const TRUNCATE_ORDER = [
  'email_notifications',
  'mailing_list_subscribers',
  'contact_submissions',
  'payments',
  'order_items',
  'orders',
  'products',
  'artworks',
  'site_settings',
  'admin_users',
] as const;

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _migrated = false;

export async function createTestDb() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DATABASE_URL must be set for integration tests');

  if (!_client) {
    _client = postgres(url, { max: 5 });
    _db = drizzle(_client, { schema });
  }

  const db = _db!;

  if (!_migrated) {
    await migrate(db, { migrationsFolder: path.join(process.cwd(), 'lib/db/migrations') });
    _migrated = true;
  }

  async function truncateAll() {
    // Disable FK checks, truncate all tables, re-enable
    await db.execute(sql.raw(
      `TRUNCATE TABLE ${TRUNCATE_ORDER.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`
    ));
  }

  async function teardown() {
    // Nothing to tear down per-suite; pool is reused across all test files.
    // The final cleanup (closing the connection) happens when the process exits.
  }

  return { db, truncateAll, teardown };
}
