import { SchemaTs, ForeignKeyType } from '../sqlTypes';
import { gameStatline } from './gameResult';

// TODO support playoff averages
export const teamSeasonSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  team_id: 'INTEGER',
  season_id: 'INTEGER',
  games_played: 'INTEGER',
  wins: 'INTEGER',
  losses: 'INTEGER',
  conference_rank: 'INTEGER',
  playoff_seed: 'INTEGER',

  // Averages
  ...gameStatline,

  team_key: ['team_id', 'teams', 'id'] as ForeignKeyType,
  season_key: ['season_id', 'seasons', 'id'] as ForeignKeyType,
} as const;

export type TeamSeason = SchemaTs<typeof teamSeasonSchemaSql>;
