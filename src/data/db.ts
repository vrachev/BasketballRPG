import type { DB as DBSchema } from './schema.js';
import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';

const dialect = new SqliteDialect({
  database: new SQLite('sqlite/database.db'),
});

const db = new Kysely<DBSchema>({
  dialect,
});

export default db;
