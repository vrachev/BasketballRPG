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

export async function createDialect(dbRelPath: string): Promise<Dialect> {
  const config = await loadConfig();

  if (config.MODE === 'browser') {
    const { SQLocalKysely } = await import('sqlocal/kysely');
    const { dialect } = new SQLocalKysely(dbRelPath);
    logger.debug({ dialect: 'SQLocalKysely', dbRelPath }, "SQLite dialect initialized");
    return dialect;
  } else {
    const { default: SQLite } = await import('better-sqlite3');
    const { SqliteDialect } = await import('kysely');
    const path = await import('path');
    dbRelPath = path.join(process.cwd(), dbRelPath);
    logger.debug({ dialect: 'better-sqlite3', dbRelPath }, "SQLite dialect initialized");
    return new SqliteDialect({
      database: new SQLite(dbRelPath),
    });
  }
}

function appendQueryEvent(event: LogEvent) {
  logger.trace({ query: event.query, duration: event.queryDurationMillis }, "Query executed");
  queryStats.totalQueries++;
  queryStats.totalDurationMs += event.queryDurationMillis;
  queryStats.averageDurationMs = queryStats.totalDurationMs / queryStats.totalQueries;
}

type LeagueId = string;

// DB singleton instances for each league
const dbInstances = new Map<LeagueId, Kysely<DBSchema>>();
let currentLeagueId: LeagueId | null = null;

export async function getDb(leagueId?: LeagueId): Promise<Kysely<DBSchema>> {
  if (!leagueId) {
    if (currentLeagueId) {
      if (!dbInstances.has(currentLeagueId)) {
        throw new Error("No db instance for current league");
      }
      return dbInstances.get(currentLeagueId)!;
    }

    throw new Error("No league id provided, no existing leagueId");
  }


  if (!dbInstances.has(leagueId)) {
    const dialect = await createDialect(leagueId);
    dbInstances.set(leagueId, new Kysely<DBSchema>({ dialect, log: appendQueryEvent }));
  }

  currentLeagueId = leagueId;
  return dbInstances.get(leagueId)!;
}

export function getQueryStats(): Readonly<QueryStats> {
  return Object.freeze({ ...queryStats });
}

export default getDb;
