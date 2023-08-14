import { InferModel, eq } from 'drizzle-orm';
import { playerMinutes, players } from './db/schema';
import db from './db/db';

type NewPlayerMinutes = InferModel<typeof playerMinutes, 'insert'>;

type MissingPlayer = {
  name: string;
  teamId: number;
  minutes: number;
  matchId: number;
};

const missingPlayers: MissingPlayer[] = [
  {
    name: 'JAKUB LASKOWSKI',
    teamId: 15,
    minutes: 1,
    matchId: 366,
  },
];

const insertMissingPlayerMinutes = async (missingPlayers: MissingPlayer[]) => {
  const playerMinutesToAdd: NewPlayerMinutes[] = [];
  const missingPlayerArray: string[] = [];
  missingPlayers.forEach(async (player) => {
    const result = await db
      .select()
      .from(players)
      .where(eq(players.name, player.name.toUpperCase()));
    if (result.length > 0) {
      console.log(result);
      playerMinutesToAdd.push({
        minutes: player.minutes,
        matchId: player.matchId,
        playerId: result[0].id,
        teamId: player.teamId,
      });
    } else {
      console.log(
        `Still cannot find ${player.name} playing in match ${player.matchId}`
      );
      missingPlayerArray.push(`${player.name} from match ${player.matchId}`);
    }
  });
  setTimeout(async () => {
    console.log(
      'Adding everyone except these missing players:',
      missingPlayerArray
    );
    await db.insert(playerMinutes).values(playerMinutesToAdd);
  }, 10000);
};

insertMissingPlayerMinutes(missingPlayers);
