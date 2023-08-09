import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { InferModel } from 'drizzle-orm';
import { teams } from './db/schema';
dotenv.config();

type NewTeam = InferModel<typeof teams, 'insert'>;

const connectionString = process.env.CONNECTION_STRING || '';
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

const mensTeams = [
  'Scrosoppi FC',
  'Vaughan Azzurri',
  'Blue Devils FC',
  'Simcoe County Rovers FC',
  'Guelph United',
  'Alliance United FC',
  'Burlington SC',
  'Electric City FC',
  'North Toronto Nitros',
  'Sigma FC',
  'Woodbridge Strikers',
  'Hamilton United',
  'FC London',
  'Darby FC',
  'Windsor City FC',
  'St. Catharines Roma Wolves',
  'North Mississauga SC',
  "Master's FA",
  'Unionville Milliken S.C.',
  'BVB IA Waterloo',
];

const importTeams = async (newTeams: string[]) => {
  const mappedTeams = newTeams.map(
    (team): NewTeam => ({
      name: team,
      division: "Men's Premier",
    })
  );

  await db.insert(teams).values(mappedTeams);
};

importTeams(mensTeams);
