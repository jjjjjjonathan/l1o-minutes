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

const mensReserveTeams = [
  'Electric City FC U21',
  'Pickering FC U21',
  'Alliance United U21',
  "Master's FA U21 North East",
  'Unionville Milliken SC U21',
  'Darby FC U21',
  'Aurora FC U21',
  'Simcoe County Rovers FC U21 North East',
  'Woodbridge Strikers U21',
  'North Toronto Nitros U21',
  'Sigma FC U21',
  'Simcoe County Rovers FC U21 Central',
  'Vaughan SC U21',
  'Toronto Skillz FC U21',
  'Toronto High Park U21',
  "Master's FA U21 Central",
  'ProStars FC U21',
  'Blue Devils FC U21',
  'Scrosoppi FC U21',
  'North Mississauga SC U21',
  'Rush Canada U21',
  'Hamilton United U21',
  'Burlington SC U21',
  'Oakville SC U21',
  'Guelph United U21',
  'Cambridge United U21',
  'Whitecaps London U21',
  'FC London U21',
  'Tecumseh SC U21',
  'Windsor City FC U21',
  'BVB IA Waterloo U21',
  'St. Catharines Roma Wolves U21',
  'Sigma FC U19',
  'Woodbridge Strikers U19',
  'Alliance United U19',
  'North Toronto Nitros U19',
  'Simcoe County Rovers FC U19',
  'Vaughan SC U19',
  'Masters FA U19',
  'Unionville Milliken SC U19',
  'Pickering FC U19',
  'Richmond Hill SC U19',
  'Darby FC U19',
  'North Mississauga SC U19',
  'Rush Canada U19',
  'Burlington SC U19',
  'ProStars FC U19',
  'Hamilton United U19',
  'Scrosoppi FC U19',
  'Cambridge United U19',
  'Guelph United U19',
  'Blue Devils FC U19',
  'Brampton SC U19',
  'St. Catherines Roma Wolves U19',
];

const womensReserveTeams = [
  "Alliance United Women's Reserve",
  "Simcoe County Rovers Women's Reserve NE",
  "Electric City FC Women's Reserve",
  'Pickering FC Women',
  'Aurora FC Women',
  "Unionville Milliken SC Women's Reserve",
  "Master's FA Women",
  "Darby FC Women's Reserve",
  "BVB IA Waterloo Women's Reserve",
  'Whitecaps London SC Women',
  'Cambridge United Women',
  "FC London Women's Reserve",
  "Hamilton United Women's Reserve",
  "Burlington SC Women's Reserve",
  "St. Catherines Roma Wolves Women's Reserve",
  'Scrosoppi FC Women',
  "North Toronto Nitros Women's Reserve",
  "Woodbridge Strikers Women's Reserve",
  "Vaughan Azzurri Women's Reserve",
  "North Mississauga SC Women's Reserve",
  "Blue Devils FC Women's Reserve",
  "Simcoe County Rovers Women's Reserve Central",
  "ProStars FC Women's Reserve",
  'Rush Canada Women',
  "Pickering FC Women's U19",
  "North Toronto Nitros Women's U19",
  "Vaughan SC Women's U19",
  "FC Durham Women's U19",
  "Unionville Milliken SC Women's U19",
  "Woodbridge Strikers Women's U19",
  "Darby FC Women's U19",
  "Tecumseh SC Women's U19",
  "Rush Canada Women's U19",
  "North Mississauga SC Women's U19",
  "Oakville SC Women's U19",
  "Hamilton United Women's U19",
  "Windsor City Women's U19",
  "St. Catharines Roma Wolves Women's U19",
];

const importTeams = async (newTeams: string[]) => {
  const mappedTeams = newTeams.map(
    (team): NewTeam => ({
      name: team,
      division: "Women's Reserve League",
    })
  );

  await db.insert(teams).values(mappedTeams);
};

importTeams(womensReserveTeams)
  .then(() => {
    console.log('Teams have been added');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
