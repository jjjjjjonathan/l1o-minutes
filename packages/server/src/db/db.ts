import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const connectionString = process.env.CONNECTION_STRING || '';
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql, { logger: true });

export default db;
