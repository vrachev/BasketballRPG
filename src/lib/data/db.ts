import type { DB as DBSchema } from './schema.js';
import type { Dialect, LogEvent } from 'kysely';
import { Kysely } from 'kysely';
import { loadConfig } from '../config.js';
import { logger } from '../logger.js';

type QueryStats = {
  totalQueries: number;
  totalDurationMs: number;
  averageDurationMs: number;
};

const queryStats: QueryStats = {
  totalQueries: 0,
  totalDurationMs: 0,
  averageDurationMs: 0,
};

export async function createDialect(dbPath: string): Promise<Dialect> {
  const config = await loadConfig();

  if (config.MODE === 'browser') {
    const { SQLocalKysely } = await import('sqlocal/kysely');
    const { dialect } = new SQLocalKysely(dbPath);
    logger.debug({ dialect: 'SQLocalKysely', dbPath }, "SQLite dialect initialized");
    return dialect;
  } else {
    const { default: SQLite } = await import('better-sqlite3');
    const { SqliteDialect } = await import('kysely');
    const path = await import('path');
    dbPath = path.join(process.cwd(), 'sqlite', dbPath);
    logger.debug({ dialect: 'better-sqlite3', dbPath }, "SQLite dialect initialized");
    return new SqliteDialect({
      database: new SQLite(dbPath),
    });
  }
}

function appendQueryEvent(event: LogEvent) {
  logger.trace({ query: event.query, duration: event.queryDurationMillis }, "Query executed");
  queryStats.totalQueries++;
  queryStats.totalDurationMs += event.queryDurationMillis;
  queryStats.averageDurationMs = queryStats.totalDurationMs / queryStats.totalQueries;
}

type LeagueId = number | string;
// DB singleton instances for each league
const dbInstances = new Map<LeagueId, Kysely<DBSchema>>();

export async function getDb(leagueId?: LeagueId): Promise<Kysely<DBSchema>> {
  // hardcode for now
  if (!leagueId) {
    leagueId = 'dev';
  }
  if (!dbInstances.has(leagueId)) {
    const dialect = await createDialect(`bball-league-${leagueId}.db`);
    dbInstances.set(leagueId, new Kysely<DBSchema>({ dialect, log: appendQueryEvent }));
  }
  return dbInstances.get(leagueId)!;
}

export function getQueryStats(): Readonly<QueryStats> {
  return Object.freeze({ ...queryStats });
}

export default getDb;
