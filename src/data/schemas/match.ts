import { SchemaTs, ForeignKeyType } from '../sqlTypes';

export const matchSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  date: 'TEXT',
  home_team_id: 'INTEGER',
  away_team_id: 'INTEGER',
  home_team_score: 'INTEGER',
  away_team_score: 'INTEGER',
  season_year: 'INTEGER',
  is_playoff: 'INTEGER',
  attendance: 'INTEGER',
  arena: 'TEXT',
  home_team_offensive_rating: 'REAL',
  home_team_defensive_rating: 'REAL',
  away_team_offensive_rating: 'REAL',
  away_team_defensive_rating: 'REAL',
  pace: 'REAL',
  homeTeam: ['home_team_id', 'teams', 'id'] as ForeignKeyType,
  awayTeam: ['away_team_id', 'teams', 'id'] as ForeignKeyType
} as const;

export type Match = SchemaTs<typeof matchSchemaSql>;
