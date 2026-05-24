-- Change MockInterviewSession.jobId FK from CASCADE to SET NULL
-- When a Job is deleted we want to keep the interview session; just null out jobId.

DO $$ BEGIN
  -- Drop the existing CASCADE FK if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'MockInterviewSession_jobId_fkey'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE "MockInterviewSession"
      DROP CONSTRAINT "MockInterviewSession_jobId_fkey";
  END IF;

  -- Re-add with SET NULL behaviour
  ALTER TABLE "MockInterviewSession"
    ADD CONSTRAINT "MockInterviewSession_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "Job"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
END $$;
