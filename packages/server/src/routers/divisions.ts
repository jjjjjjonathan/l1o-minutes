import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import db from '../db/db';
import { teams, divisions, players, playerMinutes } from '../db/schema';
import { eq, sql, and, lte, gte } from 'drizzle-orm';

export const divisionsRouter = createTRPCRouter({
  getDivisions: publicProcedure.query(async () => {
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
  getDivisionSummary: publicProcedure
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
  getDivisionStats: publicProcedure
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
});
