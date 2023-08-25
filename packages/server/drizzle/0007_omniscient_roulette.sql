ALTER TABLE "player_minutes" ADD COLUMN "division_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "player_minutes" ADD CONSTRAINT "player_minutes_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
