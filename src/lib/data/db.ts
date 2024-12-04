import type { DB as DBSchema } from './schema.js';
import type { Dialect } from 'kysely';
import { Kysely } from 'kysely';
import { loadConfig } from '../config.js';

async function createDialect(): Promise<Dialect> {
  const config = await loadConfig();

  if (config.MODE === 'browser') {
    const { SQLocalKysely } = await import('sqlocal/kysely');
    const { dialect } = new SQLocalKysely(config.DB_PATH);
    return dialect;
  } else {
    const { default: SQLite } = await import('better-sqlite3');
    const { SqliteDialect } = await import('kysely');
    return new SqliteDialect({
      database: new SQLite(config.DB_PATH),
    });
  }
}

let db: Kysely<DBSchema>;

export async function getDb(): Promise<Kysely<DBSchema>> {
  if (!db) {
    const dialect = await createDialect();
    db = new Kysely<DBSchema>({ dialect });
  }
  return db;
}

export default getDb;
