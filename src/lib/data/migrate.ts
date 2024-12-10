import type { DB } from './schema.js';
import { Kysely, Migrator } from 'kysely';
import { StaticMigrationProvider } from './migrationProvider.js';
import { logger } from '../logger.js';
import { createDialect } from './db.js';

export async function migrateDb(dbPath: string) {
  const dialect = await createDialect(dbPath);
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
      logger.info({ migrationName: it.migrationName }, "Migration successful");
    } else if (it.status === 'Error') {
      logger.error({ migrationName: it.migrationName }, "Migration failed");
    }
  });

  if (error) {
    logger.error({ error }, "Database migration failed");
    process.exit(1);
  }

  await db.destroy();
}
