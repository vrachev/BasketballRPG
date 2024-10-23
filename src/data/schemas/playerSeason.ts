import { SchemaTs, ForeignKeyType } from '../sqlTypes';

const playerSeasonSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  year: 'INTEGER',
  season_type: 'TEXT', // regular_season, playoffs
  position: 'TEXT',

  // SKILLS
  // Physical Skills
  strength: 'REAL',
  speed: 'REAL',
  lateral_quickness: 'REAL',
  shiftiness: 'REAL',
  vertical_jump: 'REAL',
  endurance: 'REAL',

  // Shooting Skills
  free_throw: 'REAL',
  // Two Point
  inside: 'REAL',
  layup: 'REAL',
  dunk: 'REAL',
  floater: 'REAL',
  turnaround: 'REAL',
  step_back: 'REAL',
  mid_range: 'REAL',
  two_point_fadeaway: 'REAL',
  // Three Point
  three_point_catch_and_shoot: 'REAL',
  three_point_step_back: 'REAL',
  three_point_pull_up: 'REAL',
  three_point_deep: 'REAL',

  // IQ
  offensive_iq: 'REAL',
  defensive_iq: 'REAL',
  patience: 'REAL',

  // Intangibles
  grit: 'REAL',
  leadership: 'REAL',
  clutch_gene: 'REAL',
  offensive_motor: 'REAL',
  defensive_motor: 'REAL',
  streakiness: 'REAL',
  handle_pressure: 'REAL',
  driven: 'REAL',
  emotional: 'REAL',

  // Basketball skills
  dribbling: 'REAL',
  playmaking: 'REAL',
  passing: 'REAL',
  offensive_rebounding: 'REAL',
  defensive_rebounding: 'REAL',
  post_game: 'REAL',

  // Tendencies
  // Playmaking tendencies
  tendency_pass: 'REAL',
  tendency_score: 'REAL',
  tendency_drive_to_basket: 'REAL',
  // Shot qualifier tendencies
  tendency_catch_and_shoot: 'REAL',
  tendency_pull_up: 'REAL',
  tendency_step_back: 'REAL',
  tendency_fadeaway: 'REAL',
  // Shot type tendencies
  tendency_mid_range: 'REAL',
  tendency_three_point: 'REAL',
  tendency_hook: 'REAL',
  tendency_post: 'REAL',
  // Rebounding tendencies
  tendency_offensive_rebounding: 'REAL',
  tendency_defensive_rebounding: 'REAL',

  // STATISTICS
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

  // Foreign keys
  team_id: 'INTEGER',
  player_id: 'INTEGER',
  player_key: ['player_id', 'players', 'id'] as ForeignKeyType,
  team_key: ['team_id', 'teams', 'id'] as ForeignKeyType,
} as const;

type PlayerSeason = SchemaTs<typeof playerSeasonSchemaSql>;

export { playerSeasonSchemaSql, PlayerSeason };
