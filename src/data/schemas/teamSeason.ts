import { SchemaTs, ForeignKeyType } from '../sqlTypes';

export const teamSeasonSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  team_id: 'INTEGER',
  season_id: 'INTEGER',
  wins: 'INTEGER',
  losses: 'INTEGER',
  conference_rank: 'INTEGER',
  playoff_seed: 'INTEGER',
  offensive_rating: 'REAL',
  defensive_rating: 'REAL',
  net_rating: 'REAL',
  pace: 'REAL',

  team_key: ['team_id', 'teams', 'id'] as ForeignKeyType,
  season_key: ['season_id', 'seasons', 'id'] as ForeignKeyType,
} as const;

export type TeamSeason = SchemaTs<typeof teamSeasonSchemaSql>;
