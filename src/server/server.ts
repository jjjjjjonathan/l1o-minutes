import express, { Application } from 'express';
import 'dotenv/config';
import { router } from './trpc';

const appRouter = router({});

export type AppRouter = typeof appRouter;

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', (req, res) => {
  res.send('hello world');
});
