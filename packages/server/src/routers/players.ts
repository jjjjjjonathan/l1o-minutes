import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import db from '../db/db';
import { players } from '../db/schema';
import { ilike } from 'drizzle-orm';

export const playersRouter = createTRPCRouter({
  searchForPlayer: publicProcedure
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
  addNewPlayer: publicProcedure
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
});
