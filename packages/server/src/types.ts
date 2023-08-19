import { InferModel } from 'drizzle-orm';
import { teams, players, playerMinutes } from './db/schema';

export type Team = InferModel<typeof teams, 'select'>;
export type Player = InferModel<typeof players, 'select'>;
export type PlayerMinute = InferModel<typeof playerMinutes, 'select'>;
export type NewPlayerMinute = InferModel<typeof playerMinutes, 'insert'>;
