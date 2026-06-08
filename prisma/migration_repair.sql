-- Flawless self-healing database migration repair script.
-- If the WorkflowDefinition table does not physically exist in the database,
-- it means the stabilization migration was marked as applied but skipped without running its SQL.
-- In that case, we delete its migration record to force Prisma to re-run it and create the tables.
-- Once the tables are successfully created, this check becomes false and is a no-op in all future builds.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'WorkflowDefinition'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'AiProviderConfig'
  ) THEN
    DELETE FROM "_prisma_migrations" WHERE "migration_name" = '20260529000000_stabilization_and_orchestration';
  END IF;
END $$;

-- Always clean up the remaining enums migration record if it is in a failed/incomplete state
DELETE FROM "_prisma_migrations" 
WHERE "migration_name" = '20260529120000_create_remaining_enums_and_columns' 
AND ("finished_at" IS NULL OR "rolled_back_at" IS NOT NULL);
