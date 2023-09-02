import cors from 'cors';
import express, { Application } from 'express';
import 'dotenv/config';
import { initTRPC, inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import db from './db/db';
import { teams, divisions, players, playerMinutes } from './db/schema';
import { loadMatchHtml } from './helpers/helpers';
import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  InferModel,
  lte,
  sql,
} from 'drizzle-orm';

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
  teamId: number,
  divisionId: number
) => {
  const mappedPlayers = players.map(async (player) => {
    const playerToReturn = {
      minutes: player.minutes,
      matchId,
      playerId: 0,
      teamId,
      name: player.name,
      divisionId,
    };
    const playerResult = await getPlayer(player.name);
    if (playerResult.length > 0) {
      playerToReturn.playerId = playerResult[0].id;
    }
    return playerToReturn;
  });

  return mappedPlayers;
};

export const appRouter = t.router({
  searchForPlayer: t.procedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      if (input.name.length < 3) {
        return [];
      } else {
        const result = await db
          .select()
          .from(players)
          .where(ilike(players.name, `%${input.name}%`))
          .limit(5);
        return result;
      }
    }),

  getDivisionSummary: t.procedure
    .input(z.object({ divisionId: z.number().min(1) }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          id: teams.id,
          name: teams.name,
          leagueRank: teams.leagueRank,
          totalU23Minutes: sql<string>`sum(case when ${
            players.yearOfBirth
          } >= ${2000} then ${playerMinutes.minutes} else ${0} end)`.mapWith(
            playerMinutes.minutes
          ),
          totalU20Minutes: sql<string>`sum(case when ${
            players.yearOfBirth
          } >= ${2003} then ${playerMinutes.minutes} else ${0} end)`.mapWith(
            playerMinutes.minutes
          ),
        })
        .from(playerMinutes)
        .innerJoin(players, eq(players.id, playerMinutes.playerId))
        .innerJoin(teams, eq(teams.id, playerMinutes.teamId))
        .where(eq(teams.divisionId, input.divisionId))
        .groupBy((teams) => teams.id)
        .orderBy((teams) => teams.leagueRank);
      return result;
    }),
  insertOrUpdatePlayerMinute: t.procedure
    .input(
      z.object({
        playerId: z.number(),
        minutes: z.number(),
        teamId: z.number(),
        matchId: z.number(),
        divisionId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db
        .insert(playerMinutes)
        .values({
          playerId: input.playerId,
          minutes: input.minutes,
          teamId: input.teamId,
          matchId: input.matchId,
          divisionId: input.divisionId,
        })
        .onConflictDoUpdate({
          target: [playerMinutes.playerId, playerMinutes.matchId],
          set: { minutes: input.minutes },
        })
        .returning();
      return result;
    }),

  addNewPlayer: t.procedure
    .input(
      z.object({
        name: z.string().min(2),
        yearOfBirth: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db
        .insert(players)
        .values({
          name: input.name.toUpperCase(),
          yearOfBirth: input.yearOfBirth,
        })
        .returning();
      return result;
    }),
  getTeams: t.procedure.query(async () => {
    const result = await db.select().from(teams);
    return result;
  }),
  getDivisions: t.procedure.query(async () => {
    const result = await db
      .select({
        id: divisions.id,
        name: divisions.name,
        matchesCount: sql<number>`count(distinct ${playerMinutes.matchId})`,
      })
      .from(divisions)
      .innerJoin(playerMinutes, eq(divisions.id, playerMinutes.divisionId))
      .groupBy(divisions.id);
    return result;
  }),
  getDivisionStats: t.procedure
    .input(
      z.object({
        divisionId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const sq = db.$with('sq').as(
        db
          .select({
            medianRank: sql<number>`count(${teams.id}/2)`.as('median_rank'),
          })
          .from(teams)
          .where(eq(teams.divisionId, input.divisionId))
      );

      const topHalf = db.$with('top_half').as(
        db
          .select({
            id: teams.id,
            u23Minutes: sql<number>`sum(case when ${
              players.yearOfBirth
            } >= ${2000} then ${playerMinutes.minutes} else ${0} end)`.as(
              'u23_minutes'
            ),
            u20Minutes: sql<number>`sum(case when ${
              players.yearOfBirth
            } >= ${2003} then ${playerMinutes.minutes} else ${0} end)`.as(
              'u20_minutes'
            ),
            olderMinutes: sql<number>`sum(case when ${
              players.yearOfBirth
            } <= 1999 then ${playerMinutes.minutes} else ${0} end)`.as(
              'older_minutes'
            ),
            u22Minutes: sql<number>`sum(case when ${
              players.yearOfBirth
            } >= ${2001} then ${playerMinutes.minutes} else ${0} end)`.as(
              'u22_minutes'
            ),
          })
          .from(playerMinutes)
          .innerJoin(players, eq(players.id, playerMinutes.playerId))
          .innerJoin(teams, eq(teams.id, playerMinutes.teamId))
          .where(
            and(
              lte(
                teams.leagueRank,
                sql<number>`(select floor(count(*)/2) from teams where ${teams.divisionId} = ${input.divisionId})`
              ),
              eq(teams.divisionId, input.divisionId)
            )
          )
          .groupBy(teams.id)
      );

      const bottomHalf = db.$with('bottom_half').as(
        db
          .select({
            id: teams.id,
            u23Minutes: sql<number>`sum(case when ${
              players.yearOfBirth
            } >= ${2000} then ${playerMinutes.minutes} else ${0} end)`.as(
              'u23_minutes'
            ),
            u20Minutes: sql<number>`sum(case when ${
              players.yearOfBirth
            } >= ${2003} then ${playerMinutes.minutes} else ${0} end)`.as(
              'u20_minutes'
            ),
            olderMinutes: sql<number>`sum(case when ${
              players.yearOfBirth
            } <= 1999 then ${playerMinutes.minutes} else ${0} end)`.as(
              'older_minutes'
            ),
            u22Minutes: sql<number>`sum(case when ${
              players.yearOfBirth
            } >= ${2001} then ${playerMinutes.minutes} else ${0} end)`.as(
              'u22_minutes'
            ),
          })
          .from(playerMinutes)
          .innerJoin(players, eq(players.id, playerMinutes.playerId))
          .innerJoin(teams, eq(teams.id, playerMinutes.teamId))
          .where(
            and(
              gte(
                teams.leagueRank,
                sql<number>`(select floor(count(*)/2+1) from teams where ${teams.divisionId} = ${input.divisionId})`
              ),
              eq(teams.divisionId, input.divisionId)
            )
          )
          .groupBy(teams.id)
      );

      const result = await db
        .with(topHalf, bottomHalf)
        .select({
          averageU23MinutesTop:
            sql<number>`round(avg("top_half".${topHalf.u23Minutes}))`.mapWith(
              playerMinutes.minutes
            ),
          averageU20MinutesTop:
            sql<number>`round(avg("top_half".${topHalf.u20Minutes}))`.mapWith(
              playerMinutes.minutes
            ),
          averageOlderMinutesTop:
            sql<number>`round(avg("top_half".${topHalf.olderMinutes}))`.mapWith(
              playerMinutes.minutes
            ),
          averageU22MinutesTop:
            sql<number>`round(avg("top_half".${topHalf.u22Minutes}))`.mapWith(
              playerMinutes.minutes
            ),
          averageU23MinutesBottom:
            sql<number>`round(avg("bottom_half".${bottomHalf.u23Minutes}))`.mapWith(
              playerMinutes.minutes
            ),
          averageU20MinutesBottom:
            sql<number>`round(avg("bottom_half".${bottomHalf.u20Minutes}))`.mapWith(
              playerMinutes.minutes
            ),
          averageOlderMinutesBottom:
            sql<number>`round(avg("bottom_half".${bottomHalf.olderMinutes}))`.mapWith(
              playerMinutes.minutes
            ),
          averageU22MinutesBottom:
            sql<number>`round(avg("bottom_half".${bottomHalf.u22Minutes}))`.mapWith(
              playerMinutes.minutes
            ),
          averageU23MinutesTotal:
            sql<number>`round((avg("top_half".${topHalf.u23Minutes}) + avg("bottom_half".${bottomHalf.u23Minutes})) / 2)`.mapWith(
              playerMinutes.minutes
            ),
          averageU20MinutesTotal:
            sql<number>`round((avg("top_half".${topHalf.u20Minutes}) + avg("bottom_half".${bottomHalf.u20Minutes})) / 2)`.mapWith(
              playerMinutes.minutes
            ),
          averageOlderMinutesTotal:
            sql<number>`round((avg("top_half".${topHalf.olderMinutes}) + avg("bottom_half".${bottomHalf.olderMinutes})) / 2)`.mapWith(
              playerMinutes.minutes
            ),
          averageU22MinutesTotal:
            sql<number>`round((avg("top_half".${topHalf.u22Minutes}) + avg("bottom_half".${bottomHalf.u22Minutes})) / 2)`.mapWith(
              playerMinutes.minutes
            ),
        })
        .from(sql.raw(`"top_half", "bottom_half"`));

      const fullMark = Math.max(...Object.values(result[0])) + 500;
      return [
        {
          subject: 'U-23',
          A: result[0].averageU23MinutesTop,
          B: result[0].averageU23MinutesBottom,
          C: result[0].averageU23MinutesTotal,
          fullMark,
        },
        {
          subject: 'U-20',
          A: result[0].averageU20MinutesTop,
          B: result[0].averageU20MinutesBottom,
          C: result[0].averageU20MinutesTotal,
          fullMark,
        },
        {
          subject: 'U-22',
          A: result[0].averageU22MinutesTop,
          B: result[0].averageU22MinutesBottom,
          C: result[0].averageU22MinutesTotal,
          fullMark,
        },
        {
          subject: '1999+',
          A: result[0].averageOlderMinutesTop,
          B: result[0].averageOlderMinutesBottom,
          C: result[0].averageOlderMinutesTotal,
          fullMark,
        },
      ];
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
        .select({
          id: teams.id,
          name: teams.name,
          divisionId: teams.divisionId,
        })
        .from(teams)
        .where(
          and(
            eq(teams.name, homeTeam.teamName),
            eq(teams.divisionId, divisionId)
          )
        );

      const awayTeamResult = await db
        .select({
          id: teams.id,
          name: teams.name,
          divisionId: teams.divisionId,
        })
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
        homeTeamResult[0].id,
        divisionId
      );

      const awayPlayers = await findPlayers(
        awayTeam.players,
        matchId,
        awayTeamResult[0].id,
        divisionId
      );

      const playerList = await Promise.all(homePlayers.concat(awayPlayers));

      const confirmedPlayers = playerList.filter(
        (player) => player.playerId > 0
      );
      const missingPlayers = playerList.filter(
        (player) => player.playerId <= 0
      );
      const insertResult = await db
        .insert(playerMinutes)
        .values(confirmedPlayers)
        .onConflictDoNothing({
          target: [playerMinutes.playerId, playerMinutes.matchId],
        })
        .returning();

      const insertedPlayers = confirmedPlayers.filter((player) =>
        insertResult
          .map((insertValue) =>
            [insertValue.playerId, insertValue.matchId].join(',')
          )
          .includes([player.playerId, player.matchId].join(','))
      );

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
        insertedPlayers,
        updatedPlayers: playerMinutesToUpdate,
        missingPlayers,
        homeTeam: homeTeamResult[0],
        awayTeam: awayTeamResult[0],
        matchId,
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
