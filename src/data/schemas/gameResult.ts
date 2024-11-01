import type { ForeignKeyType, SchemaTs } from "../sqlTypes.js";

export const gameResultSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  home_team_id: 'INTEGER',
  away_team_id: 'INTEGER',
  home_team_season_id: 'INTEGER',
  away_team_season_id: 'INTEGER',
  season_id: 'INTEGER',
  season_type: 'TEXT', // pre_season, regular_season, playoffs


  // Match Info
  date: 'TEXT',
  winner_id: 'INTEGER',
  loser_id: 'INTEGER',

  // Home Team Raw Stats
  h_score: 'INTEGER',
  h_fga: 'INTEGER',
  h_fgm: 'INTEGER',
  h_three_fga: 'INTEGER',
  h_three_fgm: 'INTEGER',
  h_fta: 'INTEGER',
  h_ftm: 'INTEGER',
  h_off_reb: 'INTEGER',
  h_def_reb: 'INTEGER',
  h_reb: 'INTEGER',
  h_ast: 'INTEGER',
  h_stl: 'INTEGER',
  h_blk: 'INTEGER',
  h_to: 'INTEGER',
  h_pf: 'INTEGER',
  h_pts: 'INTEGER',

  // Home Team Derived Stats
  h_fg_pct: 'REAL',
  h_two_fg_pct: 'REAL',
  h_three_fg_pct: 'REAL',
  h_ft_pct: 'REAL',
  h_efg_pct: 'REAL',
  h_ts_pct: 'REAL',
  h_pace: 'REAL',
  h_off_rating: 'REAL',
  h_def_rating: 'REAL',
  h_net_rating: 'REAL',

  // Away Team Raw Stats
  a_score: 'INTEGER',
  a_fga: 'INTEGER',
  a_fgm: 'INTEGER',
  a_three_fga: 'INTEGER',
  a_three_fgm: 'INTEGER',
  a_fta: 'INTEGER',
  a_ftm: 'INTEGER',
  a_off_reb: 'INTEGER',
  a_def_reb: 'INTEGER',
  a_reb: 'INTEGER',
  a_ast: 'INTEGER',
  a_stl: 'INTEGER',
  a_blk: 'INTEGER',
  a_to: 'INTEGER',
  a_pf: 'INTEGER',
  a_pts: 'INTEGER',

  // Away Team Derived Stats
  a_fg_pct: 'REAL',
  a_two_fg_pct: 'REAL',
  a_three_fg_pct: 'REAL',
  a_ft_pct: 'REAL',
  a_efg_pct: 'REAL',
  a_ts_pct: 'REAL',
  a_pace: 'REAL',
  a_off_rating: 'REAL',
  a_def_rating: 'REAL',
  a_net_rating: 'REAL',

  home_team_key: ['home_team_id', 'teams', 'id'] as ForeignKeyType,
  away_team_key: ['away_team_id', 'teams', 'id'] as ForeignKeyType,
  home_team_season_key: ['home_team_season_id', 'team_seasons', 'id'] as ForeignKeyType,
  away_team_season_key: ['away_team_season_id', 'team_seasons', 'id'] as ForeignKeyType,
  season_key: ['season_id', 'seasons', 'id'] as ForeignKeyType,
} as const;

export type GameResult = SchemaTs<typeof gameResultSchemaSql>;
