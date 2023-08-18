import { InferModel, eq } from 'drizzle-orm';
import { playerMinutes, players } from './db/schema';
import db from './db/db';
import { getPlayer } from './importMatch';

type NewPlayerMinutes = InferModel<typeof playerMinutes, 'insert'>;

type MissingPlayer = {
  name: string;
  teamId: number;
  minutes: number;
  matchId: number;
};

const missingPlayers: MissingPlayer[] = [];

const insertMissingPlayerMinutes = async (missingPlayers: MissingPlayer[]) => {
  const mappedPlayers = missingPlayers.map(async (player) => {
    const result = await db
      .select()
      .from(players)
      .where(eq(players.name, player.name.toUpperCase()));
    if (result.length <= 0) {
      console.log(`Cannot find ${player.name} in the database still.`);
      return player.name;
    } else {
      return {
        minutes: player.minutes,
        matchId: player.matchId,
        playerId: result[0].id,
        teamId: player.teamId,
      };
    }
  });

  return await Promise.all(mappedPlayers);
};

insertMissingPlayerMinutes(missingPlayers)
  .then(async (data) => {
    const missingPlayers = data.filter((player) => typeof player === 'string');
    const playerMinutesToAdd = data.filter(
      (player) => typeof player !== 'string'
    ) as NewPlayerMinutes[];
    const result = await db
      .insert(playerMinutes)
      .values(playerMinutesToAdd)
      .returning();
    console.log('These players were not added: ', missingPlayers);
    console.log('These players were added: ', result);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
