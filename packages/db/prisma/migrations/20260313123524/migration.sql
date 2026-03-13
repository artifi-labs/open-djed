/*
Migration: Add a "timestamp" column to ADAStakingRewards and remove "startTimestamp"/"endTimestamp"

Description:
This migration consolidates the existing "startTimestamp" and "endTimestamp"
columns into a single "timestamp" column. The steps are:
*/

-- Add the new timestamp column as nullable
ALTER TABLE "ADAStakingRewards" 
  ADD COLUMN "timestamp" TIMESTAMP(3);

-- Populate the new timestamp column with values from startTimestamp
UPDATE "ADAStakingRewards" SET "timestamp" = "startTimestamp";

-- Set the timestamp column to NOT NULL now that all rows have been populated
ALTER TABLE "ADAStakingRewards" ALTER COLUMN "timestamp" SET NOT NULL;

-- Drop the old startTimestamp and endTimestamp columns
ALTER TABLE "ADAStakingRewards" 
  DROP COLUMN "endTimestamp",
  DROP COLUMN "startTimestamp";
