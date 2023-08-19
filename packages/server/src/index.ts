import cors from 'cors';
import { Workspace } from 'types';
import express, { Application } from 'express';
import 'dotenv/config';

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/workspaces', (_, res) => {
  const workspaces: Workspace[] = [
    { name: 'server', version: '1.0.0' },
    { name: 'types', version: '1.0.0' },
    { name: 'client', version: '1.0.0' },
  ];
  res.json({ data: workspaces });
});

app.get('/', (req, res) => {
  res.send('hello world');
});
