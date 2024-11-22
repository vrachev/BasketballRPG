import { DB } from './schema';
import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';

const dialect = new SqliteDialect({
  database: new SQLite('sqlite/database.db'),
});

const db = new Kysely<DB>({
  dialect,
});

export default db;
