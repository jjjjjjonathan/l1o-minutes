import cors from 'cors';
import express, { Application } from 'express';
import 'dotenv/config';
import { initTRPC, inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import db from './db/db';
import { teams, divisions, players, playerMinutes } from './db/schema';
import { loadMatchHtml } from './helpers/helpers';
import { and, eq, InferModel } from 'drizzle-orm';

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});
type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();

type NewPlayerMinutes = InferModel<typeof playerMinutes, 'insert'>;

type Player = {
  name: string;
  minutes: number;
};

const getPlayer = async (name: string) => {
  const playerResult = await db
    .select()
    .from(players)
    .where(eq(players.name, name.toUpperCase()));
  return playerResult;
};

const findPlayers = async (
  players: Player[],
  matchId: number,
  teamId: number
) => {
  const mappedPlayers = players.map(async (player) => {
    const playerToReturn = {
      minutes: player.minutes,
      matchId,
      playerId: 0,
      teamId,
    };
    const playerResult = await getPlayer(player.name);
    if (playerResult.length <= 0) {
      return player.name;
    } else {
      playerToReturn.playerId = playerResult[0].id;
      return playerToReturn;
    }
  });

  return mappedPlayers;
};

export const appRouter = t.router({
  getTeams: t.procedure.query(async () => {
    const result = await db.select().from(teams);
    return result;
  }),
  getDivisions: t.procedure.query(async () => {
    const result = await db.select().from(divisions);
    return result;
  }),
  scrapeMatch: t.procedure
    .input(
      z.object({
        match: z
          .string()
          .url()
          .startsWith('https://www.league1ontario.com/game/show/'),
      })
    )
    .mutation(async ({ input }) => {
      const { homeTeam, awayTeam, matchId, division } = await loadMatchHtml(
        input.match
      );
      const divisionResult = await db
        .select()
        .from(divisions)
        .where(eq(divisions.name, division));

      const divisionId = divisionResult[0].id;

      const homeTeamResult = await db
        .select({ id: teams.id })
        .from(teams)
        .where(
          and(
            eq(teams.name, homeTeam.teamName),
            eq(teams.divisionId, divisionId)
          )
        );

      const awayTeamResult = await db
        .select({ id: teams.id })
        .from(teams)
        .where(
          and(
            eq(teams.name, awayTeam.teamName),
            eq(teams.divisionId, divisionId)
          )
        );

      const homePlayers = await findPlayers(
        homeTeam.players,
        matchId,
        homeTeamResult[0].id
      );

      const awayPlayers = await findPlayers(
        awayTeam.players,
        matchId,
        awayTeamResult[0].id
      );

      const playerList = await Promise.all(homePlayers.concat(awayPlayers));

      const confirmedPlayers = playerList.filter(
        (player) => typeof player !== 'string'
      ) as NewPlayerMinutes[];
      const missingPlayers = playerList.filter(
        (player) => typeof player === 'string'
      ) as string[];
      const insertResult = await db
        .insert(playerMinutes)
        .values(confirmedPlayers)
        .onConflictDoNothing({
          target: [playerMinutes.playerId, playerMinutes.matchId],
        })
        .returning();

      const playerMinutesToUpdate = confirmedPlayers.filter(
        (player) =>
          !insertResult
            .map((insertValue) =>
              [insertValue.playerId, insertValue.matchId].join(',')
            )
            .includes([player.playerId, player.matchId].join(','))
      );

      const mappedPlayerMinutesToUpdate = playerMinutesToUpdate.map(
        async (playerMinute) => {
          const updateResult = await db
            .update(playerMinutes)
            .set({ minutes: playerMinute.minutes })
            .where(
              and(
                eq(playerMinutes.playerId, playerMinute.playerId),
                eq(playerMinutes.matchId, playerMinute.matchId)
              )
            )
            .returning();
          return updateResult[0];
        }
      );

      const updateResult = await Promise.all(mappedPlayerMinutesToUpdate);

      return {
        insertedPlayers: insertResult,
        updatedPlayers: updateResult,
        missingPlayers,
      };
    }),
});

export type AppRouter = typeof appRouter;

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
