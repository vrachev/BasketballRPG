import { SchemaTs, ForeignKeyType } from '../sqlTypes';

export const playerSeasonSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  season_type: 'TEXT', // regular_season, playoffs
  position: 'TEXT',

  // Foreign keys
  team_id: 'INTEGER',
  player_id: 'INTEGER',
  season_id: 'INTEGER',

  // Raw Stats
  games_played: 'INTEGER',
  games_started: 'INTEGER',
  mins: 'REAL',
  fgm: 'INTEGER',
  fga: 'INTEGER',
  fg_pct: 'REAL',
  three_fgm: 'INTEGER',
  three_fga: 'INTEGER',
  three_fg_pct: 'REAL',
  two_fgm: 'INTEGER',
  two_fga: 'INTEGER',
  two_fg_pct: 'REAL',
  efg_pct: 'REAL',
  ftm: 'INTEGER',
  fta: 'INTEGER',
  ft_pct: 'REAL',
  off_reb: 'INTEGER',
  def_reb: 'INTEGER',
  reb: 'INTEGER',
  ast: 'INTEGER',
  stl: 'INTEGER',
  blk: 'INTEGER',
  tov: 'INTEGER',
  pf: 'INTEGER',
  pts: 'INTEGER',

  // Foreign key references
  player_key: ['player_id', 'players', 'id'] as ForeignKeyType,
  team_key: ['team_id', 'teams', 'id'] as ForeignKeyType,
  season_key: ['season_id', 'seasons', 'id'] as ForeignKeyType,
} as const;

export type PlayerSeason = SchemaTs<typeof playerSeasonSchemaSql>;
