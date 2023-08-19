import cors from 'cors';
import { Workspace } from 'types';
import express, { Application } from 'express';
import 'dotenv/config';
import { initTRPC, inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});
type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  getWorkspaces: t.procedure.query(() => {
    const workspaces: Workspace[] = [
      { name: 'server', version: '1.0.0' },
      { name: 'types', version: '1.0.0' },
      { name: 'client', version: '1.0.0' },
    ];
    return workspaces;
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

app.get('/workspaces', (_, res) => {
  const workspaces: Workspace[] = [
    { name: 'server', version: '1.0.0' },
    { name: 'types', version: '1.0.0' },
    { name: 'client', version: '1.0.0' },
  ];
  res.json({ data: workspaces });
});
