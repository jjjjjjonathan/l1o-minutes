import cors from 'cors';
import express, { Application } from 'express';
import 'dotenv/config';
import * as trpcExpress from '@trpc/server/adapters/express';
import { divisionsRouter } from './routers/divisions';
import { playersRouter } from './routers/players';
import { playerMinutesRouter } from './routers/playerMinutes';
import { createTRPCRouter } from './trpc';
import { createContext } from './trpc';

export const appRouter = createTRPCRouter({
  divisions: divisionsRouter,
  players: playersRouter,
  playerMinutes: playerMinutesRouter,
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
