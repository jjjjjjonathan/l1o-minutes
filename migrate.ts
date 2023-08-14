import { migrate } from 'drizzle-orm/postgres-js/migrator';
import db from './src/db/db';

const runMigration = async () => {
  await migrate(db, { migrationsFolder: 'drizzle' });
};

runMigration();
