ALTER TABLE "teams" ALTER COLUMN "division_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN IF EXISTS "division";