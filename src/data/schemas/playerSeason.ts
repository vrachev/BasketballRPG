import { SchemaTs, ForeignKeyType } from '../sqlTypes';
import { gameStatline } from './gameResult';
export const playerSeasonSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  team_id: 'INTEGER',
  player_id: 'INTEGER',
  season_id: 'INTEGER',
  season_type: 'TEXT', // regular_season, playoffs
  position: 'TEXT',

  // Stats
  games_played: 'INTEGER',
  games_started: 'INTEGER',
  wins: 'INTEGER',
  losses: 'INTEGER',
  ...gameStatline,

  // Foreign key references
  player_key: ['player_id', 'players', 'id'] as ForeignKeyType,
  team_key: ['team_id', 'teams', 'id'] as ForeignKeyType,
  season_key: ['season_id', 'seasons', 'id'] as ForeignKeyType,
} as const;

export type PlayerSeason = SchemaTs<typeof playerSeasonSchemaSql>;
