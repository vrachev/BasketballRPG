import type { ForeignKeyType, SchemaTs } from '../sqlTypes.js';

const playerStatline = {
  // Stats
  secs_played: 'INTEGER',
  fga: 'INTEGER',
  fgm: 'INTEGER',
  two_fga: 'INTEGER',
  two_fgm: 'INTEGER',
  three_fga: 'INTEGER',
  three_fgm: 'INTEGER',
  ftm: 'INTEGER',
  fta: 'INTEGER',
  off_reb: 'INTEGER',
  def_reb: 'INTEGER',
  reb: 'INTEGER',
  ast: 'INTEGER',
  stl: 'INTEGER',
  blk: 'INTEGER',
  tov: 'INTEGER',
  pf: 'INTEGER',
  pts: 'INTEGER',
} as const;

export const playerStatlineSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  player_id: 'INTEGER',
  game_result_id: 'INTEGER',
  team_id: 'INTEGER',
  team_season_id: 'INTEGER',
  season_id: 'INTEGER',

  ...playerStatline,

  // Foreign Keys
  player_key: ['player_id', 'players', 'id'] as ForeignKeyType,
  game_result_key: ['game_result_id', 'game_results', 'id'] as ForeignKeyType,
  team_key: ['team_id', 'teams', 'id'] as ForeignKeyType,
  team_season_key: ['team_season_id', 'team_seasons', 'id'] as ForeignKeyType,
  season_key: ['season_id', 'seasons', 'id'] as ForeignKeyType,
} as const;

export type PlayerStatline = SchemaTs<typeof playerStatline>;
export type PlayerGameResult = SchemaTs<typeof playerStatlineSchemaSql>;
