import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';
import { InferModel, eq } from 'drizzle-orm';
import { playerMinutes, players } from './db/schema';

type NewPlayerMinutes = InferModel<typeof playerMinutes, 'insert'>;

type MissingPlayer = {
  name: string;
  teamId: number;
  minutes: number;
  matchId: number;
};

const connectionString = process.env.CONNECTION_STRING || '';
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

/*
Players still missing:
- Tomas Ribeiro (Hamilton United)
- Yuaan Cheliyan (Unionville Milliken SC)
- Andrew Popov (Unionville Milliken SC)
- Zayne Bruno (Sigma FC)
- Jack Reid (Darby FC)
- Adichiyan Asok (Unionville Milliken SC)
- Kirshawn Devananth (Unionville Milliken SC)
*/

const missingPlayers = [
  {
    name: 'TOMAS RIBEIRO', // CANNOT FIND HIM YET
    teamId: 12,
    minutes: 49,
    matchId: 3,
  },
  {
    name: 'YUAAN CHELIYAN', //missing
    teamId: 20,
    minutes: 23,
    matchId: 7,
  },
  {
    name: 'YUAAN CHELIYAN', //missing
    teamId: 20,
    minutes: 28,
    matchId: 382,
  },
  {
    name: 'YUAAN CHELIYAN', //missing
    teamId: 20,
    minutes: 18,
    matchId: 51,
  },
  {
    name: 'ANDREW POPOV', //MISSING
    teamId: 20,
    minutes: 25,
    matchId: 86,
  },
  {
    name: 'ANDREW POPOV', //MISSING
    teamId: 20,
    minutes: 27,
    matchId: 118,
  },
  {
    name: 'ANDREW POPOV', //MISSING
    teamId: 20,
    minutes: 32,
    matchId: 159,
  },
  {
    name: 'YUAAN CHELIYAN', //missing
    teamId: 20,
    minutes: 29,
    matchId: 304,
  },
  {
    name: 'ANDREW POPOV', //MISSING
    teamId: 20,
    minutes: 1,
    matchId: 304,
  },
  {
    name: 'ZAYNE BRUNO', //missing
    teamId: 10,
    minutes: 10,
    matchId: 335,
  },
  {
    name: 'YUAAN CHELIYAN', //missing
    teamId: 20,
    minutes: 90,
    matchId: 341,
  },
  {
    name: 'JACK REID', //missing
    teamId: 14,
    minutes: 4,
    matchId: 348,
  },
  {
    name: 'ADCHIYAN  ASOK', //missing
    teamId: 20,
    minutes: 71,
    matchId: 353,
  },
  {
    name: 'KIRSHAWN DEVANANTH', //missing
    teamId: 20,
    minutes: 19,
    matchId: 353,
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
