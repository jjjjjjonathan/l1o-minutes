import {
  pgTable,
  serial,
  text,
  integer,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  yearOfBirth: integer('year_of_birth').notNull(),
});

export const divisionEnum = pgEnum('division', [
  "Men's Premier",
  "Women's Premier",
]);

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  division: divisionEnum('division'),
});

export const playerMinutes = pgTable('player_minutes', {
  id: serial('id').primaryKey(),
  minutes: integer('minutes').notNull(),
  matchId: integer('match_id').notNull(),
  playerId: integer('player_id')
    .references(() => players.id, { onDelete: 'cascade' })
    .notNull(),
  teamId: integer('team_id')
    .references(() => teams.id, { onDelete: 'cascade' })
    .notNull(),
});
