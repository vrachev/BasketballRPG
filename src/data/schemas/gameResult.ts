import type { ForeignKeyType, SchemaTs } from "../sqlTypes.js";

// Helper function to prefix all keys in an object
export const prefixKeys = <T extends Record<string, any>>(obj: T, prefix: string) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [`${prefix}${key}`, value])
  ) as { [K in keyof T as `${typeof prefix}${string & K}`]: T[K] };
};

// Raw stats that will be prefixed with 'h_' and 'a_', for home or away teams.
export const teamGameStats = {
  // Raw Stats
  fga: 'INTEGER',
  fgm: 'INTEGER',
  two_fga: 'INTEGER',
  two_fgm: 'INTEGER',
  three_fga: 'INTEGER',
  three_fgm: 'INTEGER',
  fta: 'INTEGER',
  ftm: 'INTEGER',
  off_reb: 'INTEGER',
  def_reb: 'INTEGER',
  reb: 'INTEGER',
  ast: 'INTEGER',
  stl: 'INTEGER',
  blk: 'INTEGER',
  tov: 'INTEGER',
  fouls: 'INTEGER',
  pts: 'INTEGER',

  // Derived Stats
  fg_pct: 'REAL',
  two_fg_pct: 'REAL',
  three_fg_pct: 'REAL',
  ft_pct: 'REAL',
  efg_pct: 'REAL',
  ts_pct: 'REAL',
  pace: 'REAL',
  off_rating: 'REAL',
  def_rating: 'REAL',
  net_rating: 'REAL',
} as const;

// Create raw schema types for home and away stats
type HomeTeamStatsSchema = {
  [K in keyof typeof teamGameStats as `h_${string & K}`]: typeof teamGameStats[K]
};

type AwayTeamStatsSchema = {
  [K in keyof typeof teamGameStats as `a_${string & K}`]: typeof teamGameStats[K]
};

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

  // Home Team Stats
  ...prefixKeys(teamGameStats, 'h_'),

  // Away Team Stats
  ...prefixKeys(teamGameStats, 'a_'),

  // Foreign Keys
  home_team_key: ['home_team_id', 'teams', 'id'] as ForeignKeyType,
  away_team_key: ['away_team_id', 'teams', 'id'] as ForeignKeyType,
  home_team_season_key: ['home_team_season_id', 'team_seasons', 'id'] as ForeignKeyType,
  away_team_season_key: ['away_team_season_id', 'team_seasons', 'id'] as ForeignKeyType,
  season_key: ['season_id', 'seasons', 'id'] as ForeignKeyType,
} as const;

export type TeamGameStats = SchemaTs<typeof teamGameStats>;

// Combine raw schemas first, then apply SchemaTs
export type GameResult = SchemaTs<
  typeof gameResultSchemaSql & HomeTeamStatsSchema & AwayTeamStatsSchema
>;
