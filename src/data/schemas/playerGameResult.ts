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

export const playerGameResultSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  player_id: 'INTEGER',
  game_result_id: 'INTEGER',
  team_id: 'INTEGER',
  season_id: 'INTEGER',
  season_type: 'TEXT', // pre_season, regular_season, playoffs
  win: 'INTEGER', // 0 is loss, 1 is win
  date: 'TEXT',

  ...playerStatline,

  // Foreign Keys
  player_key: ['player_id', 'players', 'id'] as ForeignKeyType,
  game_result_key: ['game_result_id', 'game_results', 'id'] as ForeignKeyType,
  team_key: ['team_id', 'teams', 'id'] as ForeignKeyType,
  season_key: ['season_id', 'seasons', 'id'] as ForeignKeyType,
} as const;

export type PlayerStatline = SchemaTs<typeof playerStatline>;
export type PlayerGameResult = SchemaTs<typeof playerGameResultSchemaSql>;
