import fs from 'fs';
import csv from 'csv-parser';
import { InferModel } from 'drizzle-orm';
import { players } from './db/schema';
import db from './db/db';

type NewPlayer = InferModel<typeof players, 'insert'>;

type PlayerFromCSV = {
  firstName: string;
  lastName: string;
  yearOfBirth: string;
};

const readCSVFile = (filePath: string): Promise<PlayerFromCSV[]> => {
  const results: PlayerFromCSV[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

const filePath = 'src/lib/players.csv';

readCSVFile(filePath)
  .then(async (data) => {
    const mappedPlayers = data.map(
      (player): NewPlayer => ({
        name: [player.firstName.trim(), player.lastName.trim()]
          .join(' ')
          .toUpperCase(),
        yearOfBirth: parseInt(player.yearOfBirth, 10),
      })
    );

    await db.insert(players).values(mappedPlayers);
  })
  .catch((error) => {
    console.error(error);
  });
