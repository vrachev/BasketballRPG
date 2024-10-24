import { ForeignKeyType, SchemaTs } from '../sqlTypes';

const playerSkillsSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  year: 'INTEGER',

  // Foreign keys
  team_id: 'INTEGER',
  player_id: 'INTEGER',
  player_key: ['player_id', 'players', 'id'] as ForeignKeyType,
  team_key: ['team_id', 'teams', 'id'] as ForeignKeyType,

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
  post: 'REAL',
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
  // Shot qualifier tendencies
  tendency_catch_and_shoot: 'REAL',
  tendency_pull_up: 'REAL',
  tendency_step_back: 'REAL',
  tendency_fadeaway: 'REAL',
  // Shot type tendencies
  tendency_mid_range: 'REAL',
  tendency_corner_three: 'REAL',
  tendency_above_the_break_three: 'REAL',
  tendency_drive_to_basket: 'REAL',
  tendency_rim: 'REAL',
  tendency_paint: 'REAL',
  // Rebounding tendencies
  tendency_offensive_rebounding: 'REAL',
  tendency_defensive_rebounding: 'REAL',
} as const;

type PlayerSkills = SchemaTs<typeof playerSkillsSchemaSql>;

export { playerSkillsSchemaSql, PlayerSkills };
