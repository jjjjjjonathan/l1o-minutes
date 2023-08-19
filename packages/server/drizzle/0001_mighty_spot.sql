ALTER TABLE "player_minutes" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "player_minutes" ADD CONSTRAINT "player_minutes_match_id_player_id" PRIMARY KEY("match_id","player_id");