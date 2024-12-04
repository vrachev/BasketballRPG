import type { Migration, MigrationProvider } from 'kysely';
import { up, down } from './migrations/initDb.js';

export class StaticMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    return {
      initDb: { up, down }
    };
  }
}
