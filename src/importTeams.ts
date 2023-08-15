import db from './db/db';
import { InferModel } from 'drizzle-orm';
import { teams } from './db/schema';

type NewTeam = InferModel<typeof teams, 'insert'>;

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
  'ProStars FC',
  'St. Catharines Roma Wolves',
  'North Mississauga SC',
  "Master's FA",
  'Unionville Milliken S.C.',
  'BVB IA Waterloo',
];

const womensTeams = [
  'NDC-Ontario',
  'Vaughan Azzurri',
  'North Toronto Nitros',
  'Alliance United FC',
  'Woodbridge Strikers',
  'FC London',
  'Simcoe County Rovers FC',
  'Electric City FC',
  'North Mississauga SC',
  'BVB IA Waterloo',
  'Blue Devils FC',
  'Guelph United',
  'St. Catharines Roma Wolves',
  'Unionville Milliken SC',
  'Hamilton United',
  'Darby FC',
  'Tecumseh SC',
  'Burlington SC',
  'ProStars FC',
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

importTeams(mensTeams)
  .then(() => {
    console.log('Teams have been added');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
