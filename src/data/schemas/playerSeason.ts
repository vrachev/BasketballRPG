import { SchemaTs, ForeignKeyType } from '../sqlTypes';

const playerSeasonSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  year: 'INTEGER',
  season_type: 'TEXT', // regular_season, playoffs
  position: 'TEXT',

  // Foreign keys
  team_id: 'INTEGER',
  player_id: 'INTEGER',
  player_key: ['player_id', 'players', 'id'] as ForeignKeyType,
  team_key: ['team_id', 'teams', 'id'] as ForeignKeyType,

  // Base stats
  games_played: 'INTEGER',
  games_started: 'INTEGER',
  minutes_played: 'REAL',
  field_goals_made: 'INTEGER',
  field_goals_attempted: 'INTEGER',
  field_goals_percentage: 'REAL',
  three_point_field_goals_made: 'INTEGER',
  three_point_field_goals_attempted: 'INTEGER',
  three_point_field_goals_percentage: 'REAL',
  two_point_field_goals_made: 'INTEGER',
  two_point_field_goals_attempted: 'INTEGER',
  two_point_field_goals_percentage: 'REAL',
  effective_field_goal_percentage: 'REAL',
  free_throws_made: 'INTEGER',
  free_throws_attempted: 'INTEGER',
  free_throws_percentage: 'REAL',
  offensive_rebounds: 'INTEGER',
  defensive_rebounds: 'INTEGER',
  rebounds: 'INTEGER',
  assists: 'INTEGER',
  steals: 'INTEGER',
  blocks: 'INTEGER',
  turnovers: 'INTEGER',
  fouls: 'INTEGER',
  points: 'INTEGER',
} as const;

type PlayerSeason = SchemaTs<typeof playerSeasonSchemaSql>;

export { playerSeasonSchemaSql, PlayerSeason };
