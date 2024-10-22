import { SchemaTs, ForeignKeyType } from '../sqlTypes';

const playerSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',

  // Personal Info
  first_name: 'TEXT',
  last_name: 'TEXT',
  full_name: 'TEXT',

  // Physical Info
  age: 'REAL',
  height: 'REAL',
  weight: 'REAL',
  wingspan: 'REAL',
  position: 'TEXT',

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

  // Career Info
  career_status: 'TEXT',
  experience: 'INTEGER',
  team_id: 'INTEGER',
  teamKey: ['team_id', 'teams', 'id'] as ForeignKeyType
} as const;

type Player = SchemaTs<typeof playerSchemaSql>;

export { playerSchemaSql, Player };
