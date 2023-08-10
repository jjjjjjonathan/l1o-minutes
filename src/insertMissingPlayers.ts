import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';
import { InferModel, eq } from 'drizzle-orm';
import { playerMinutes, players, teams } from './db/schema';

type NewPlayerMinutes = InferModel<typeof playerMinutes, 'insert'>;

type DbPlayer = InferModel<typeof players, 'select'>;

type MissingPlayer = {
  name: string;
  teamId: number;
  minutes: number;
};

const connectionString = process.env.CONNECTION_STRING || '';
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

const missingPlayers = [
  {
    name: 'JARRED PHILLIPS',
    teamId: 2,
    minutes: 19,
  },
  {
    name: 'KAOSTUBH BOLLA',
    teamId: 9,
    minutes: 15,
  },
];

const insertMissingPlayerMinutes = async (
  missingPlayers: MissingPlayer[],
  matchId: number
) => {
  missingPlayers.forEach(async (player) => {
    const result = await db
      .select()
      .from(players)
      .where(eq(players.name, player.name));
    if (result.length > 0) {
      console.log(`Adding ${player.name}`);
      await db.insert(playerMinutes).values({
        minutes: player.minutes,
        matchId,
        playerId: result[0].id,
        teamId: player.teamId,
      });
    } else {
      console.log(`Still cannot find ${player.name}`);
    }
  });
};

insertMissingPlayerMinutes(missingPlayers, 1);
