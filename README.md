# Gloriah Mutheu — Artist Site

Next.js 16 portfolio and shop site with Paystack checkout and an artist dashboard CMS.

## Getting started

Copy the example env file and fill in the values:

```bash
cp .env.example .env.local
```

Start the local database (requires Docker):

```bash
docker-compose up -d
```

Install dependencies, run migrations, and seed the admin user:

```bash
npm install
npm run db:migrate
npm run db:seed
```

Start the dev server:

```bash
npm run dev
```

## Database migrations

Migrations are managed with [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview). Generated SQL files live in `lib/db/migrations/`.

### Workflow for schema changes

**1. Edit the schema** in `lib/db/schema.ts`.

**2. Generate a migration file** from the diff:

```bash
npm run db:generate
```

This writes a new `.sql` file to `lib/db/migrations/`. Commit this file alongside your schema change.

**3. Apply locally:**

```bash
npm run db:migrate
```

### Applying migrations on Vercel (production / preview)

Vercel doesn't run migrations automatically. You must run them against the production database before (or immediately after) deploying the schema change.

**Option A — run from your local machine against the production DB**

Pull the production `DATABASE_URL` from Vercel, then migrate:

```bash
vercel env pull .env.production.local
DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d= -f2-) npm run db:migrate
```

Clean up afterwards — the file contains secrets:

```bash
rm .env.production.local
```

**Option B — Vercel build-step migration (automated)**

Add a `build` script that migrates then builds. In `package.json`:

```json
"build": "drizzle-kit migrate && next build"
```

Drizzle Kit reads `DATABASE_URL` from Vercel's environment automatically. This runs on every deployment, so migrations must be backwards-compatible with the previous deploy (i.e. additive only — no destructive column drops until the old code is no longer running).

**Option C — one-off via Vercel CLI**

For an emergency fix without a full deploy:

```bash
vercel env pull .env.production.local
DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d= -f2-) npx drizzle-kit migrate
rm .env.production.local
```

### Seeding the admin user in production

Run the seed script once after the first production deploy:

```bash
vercel env pull .env.production.local
DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d= -f2-) \
SEED_ADMIN_EMAIL=$(grep SEED_ADMIN_EMAIL .env.production.local | cut -d= -f2-) \
SEED_ADMIN_PASSWORD=$(grep SEED_ADMIN_PASSWORD .env.production.local | cut -d= -f2-) \
npm run db:seed
rm .env.production.local
```

## Available scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema directly (dev only — no migration file) |
| `npm run db:studio` | Open Drizzle Studio to browse the database |
| `npm run db:seed` | Create the admin user defined in env |
