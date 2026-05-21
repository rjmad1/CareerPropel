# Runbook: Database Operations

**Owner**: Platform Engineering  
**Last Updated**: 2026-05-21

---

## Creating a New Migration

```bash
# After modifying prisma/schema.prisma
npx prisma migrate dev --name describe-the-change

# This creates:
# prisma/migrations/YYYYMMDDHHMMSS_describe-the-change/migration.sql
```

**Before creating a migration:**
- If adding a NOT NULL column to an existing table, provide a default value or backfill strategy
- If renaming a column or table, create a new column/table + migration + backfill + then drop old
  (multi-step, never single-step rename in production)

## Deploying Migrations

```bash
# Production / staging — never run migrate dev in production
npx prisma migrate deploy
```

## Rolling Back a Migration

Prisma does not support automatic rollback. Steps:

1. Write a reverse migration SQL manually in a new migration file
2. Apply the reverse migration: `npx prisma migrate deploy`
3. OR: Mark the migration as rolled-back (dangerous): `npx prisma migrate resolve --rolled-back <name>`

## Seeding

```bash
# Full demo seed
npm run demo:seed

# Small profile (fast)
npm run demo:seed:small

# Purge demo data only
npm run demo:purge

# Dry-run purge (shows what would be deleted)
npm run demo:purge:dry
```

## Database Schema Documentation

See `docs/schema/DATABASE_SCHEMA.md` for the current schema reference.

## Setting Up a New Local Database

```sql
-- Run as postgres superuser
CREATE ROLE career_user WITH LOGIN PASSWORD 'career_pass';
CREATE DATABASE career_propel_dev OWNER career_user;
GRANT ALL PRIVILEGES ON DATABASE career_propel_dev TO career_user;
```

```bash
# Apply all migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Prisma Studio (Local Only)

```bash
npm run db:studio
# Opens at http://localhost:5555
```
