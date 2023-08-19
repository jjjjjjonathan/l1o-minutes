import cors from 'cors';
import express, { Application } from 'express';
import 'dotenv/config';
import { initTRPC, inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import db from './db/db';
import { teams } from './db/schema';

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});
type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  getTeams: t.procedure.query(async () => {
    const result = await db.select().from(teams);
    return result;
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
