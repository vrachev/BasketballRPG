import type { ForeignKeyType, SchemaTs } from '../sqlTypes';
import { statlineRaw } from './gameResult';

export const statlineAdvancedPlayer = {
  fg_pct: 'REAL',
  two_fg_pct: 'REAL',
  three_fg_pct: 'REAL',
  ft_pct: 'REAL',
  efg_pct: 'REAL',
  ts_pct: 'REAL',
} as const;

// Raw stats that will be prefixed with 'h_' and 'a_', for home or away teams.
export const statlinePlayer = {
  ...statlineRaw,
  ...statlineAdvancedPlayer,
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

  ...statlinePlayer,

  // Foreign Keys
  player_key: ['player_id', 'players', 'id'] as ForeignKeyType,
  game_result_key: ['game_result_id', 'game_results', 'id'] as ForeignKeyType,
  team_key: ['team_id', 'teams', 'id'] as ForeignKeyType,
  season_key: ['season_id', 'seasons', 'id'] as ForeignKeyType,
} as const;

export type PlayerGameResult = SchemaTs<typeof playerGameResultSchemaSql>;

export type StatlineAdvancedPlayer = SchemaTs<typeof statlineAdvancedPlayer>;
export type StatlinePlayer = SchemaTs<typeof statlineRaw & typeof statlineAdvancedPlayer>;
