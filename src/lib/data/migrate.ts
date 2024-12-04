import type { Dialect } from 'kysely';
import { Kysely } from 'kysely';
import type { DB } from './schema.js';
import { Migrator } from 'kysely';
import { StaticMigrationProvider } from './migrationProvider.js';
import { loadConfig } from '../config.js';

async function createDialect(): Promise<Dialect> {
  const config = await loadConfig();

  if (config.MODE === 'browser') {
    // Browser environment
    const { SQLocalKysely } = await import('sqlocal/kysely');
    const { dialect } = new SQLocalKysely(config.DB_PATH);
    return dialect;
  } else {
    // Server environment (default)
    const { default: SQLite } = await import('better-sqlite3');
    const { SqliteDialect } = await import('kysely');
    return new SqliteDialect({
      database: new SQLite(config.DB_PATH),
    });
  }
}

async function migrateToLatest() {
  const dialect = await createDialect();
  const db = new Kysely<DB>({
    dialect,
  });

  const migrator = new Migrator({
    db,
    provider: new StaticMigrationProvider(),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
