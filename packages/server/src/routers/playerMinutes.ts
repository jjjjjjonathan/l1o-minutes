import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import db from '../db/db';
import { teams, divisions, players, playerMinutes } from '../db/schema';
import { eq, sql, and, lte, gte, ilike } from 'drizzle-orm';
import { loadMatchHtml } from '../helpers/helpers';

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

export const playerMinutesRouter = createTRPCRouter({
  scrapeMatch: publicProcedure
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
  insertOrUpdatePlayerMinute: publicProcedure
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
});
