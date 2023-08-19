import { migrate } from 'drizzle-orm/postgres-js/migrator';
import db from './db/db';

const runMigration = async () => {
  await migrate(db, { migrationsFolder: 'drizzle' });
};

runMigration()
  .then(() => {
    console.log('migration ran');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
