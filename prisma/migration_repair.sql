-- Conditionally clean up failed or rolled-back stabilization migrations
-- This ensures that if the database is in a broken state where the tables were never created,
-- the migrations will be re-run from scratch to safely create them.
-- Once the migrations succeed, finished_at is populated and rolled_back_at is NULL,
-- so this query becomes a no-op in all future builds.
DELETE FROM "_prisma_migrations" 
WHERE "migration_name" IN (
  '20260529000000_stabilization_and_orchestration', 
  '20260529120000_create_remaining_enums_and_columns'
) 
AND ("finished_at" IS NULL OR "rolled_back_at" IS NOT NULL);
