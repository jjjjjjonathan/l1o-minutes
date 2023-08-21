import {
  pgTable,
  serial,
  text,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  yearOfBirth: integer('year_of_birth').notNull(),
});

export const divisions = pgTable('divisions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  divisionId: integer('division_id')
    .references(() => divisions.id, {
      onDelete: 'cascade',
    })
    .notNull(),
});

export const playerMinutes = pgTable(
  'player_minutes',
  {
    minutes: integer('minutes').notNull(),
    matchId: integer('match_id').notNull(),
    playerId: integer('player_id')
      .references(() => players.id, { onDelete: 'cascade' })
      .notNull(),
    teamId: integer('team_id')
      .references(() => teams.id, { onDelete: 'cascade' })
      .notNull(),
  },
  ({ matchId, playerId }) => {
    return {
      pk: primaryKey(matchId, playerId),
    };
  }
);
