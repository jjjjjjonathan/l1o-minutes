import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import db from '../db/db';
import { teams, players, playerMinutes } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export const teamsRouter = createTRPCRouter({
  getSingleTeam: publicProcedure
    .input(
      z.object({
        id: z.number().min(1),
      })
    )
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.id));
      return result;
    }),

  getPlayersFromTeam: publicProcedure
    .input(
      z.object({
        id: z.number().min(1),
      })
    )
    .query(async ({ input }) => {
      const result = await db
        .select({
          playerId: players.id,
          playerName: players.name,
          yearOfBirth: players.yearOfBirth,
          totalMinutes: sql<number>`sum(${playerMinutes.minutes})`
            .mapWith(playerMinutes.minutes)
            .as('total_minutes'),
          isU23: sql<boolean>`case when ${
            players.yearOfBirth
          } >= ${2000} then ${true} else ${false} end`,
          isU20: sql<boolean>`case when ${
            players.yearOfBirth
          } >= ${2003} then ${true} else ${false} end`,
        })
        .from(playerMinutes)
        .innerJoin(players, eq(players.id, playerMinutes.playerId))
        .innerJoin(teams, eq(teams.id, playerMinutes.teamId))
        .where(eq(teams.id, input.id))
        .groupBy(players.id)
        .orderBy(sql.raw('total_minutes desc'));
      return result;
    }),
});
