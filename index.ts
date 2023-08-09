import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = '';
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

const runMigration = async () => {
  await migrate(db, { migrationsFolder: 'drizzle' });
};

runMigration();
