/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface GameResult {
  a_ast: number;
  a_blk: number;
  a_def_reb: number;
  a_fga: number;
  a_fgm: number;
  a_fouls: number;
  a_fta: number;
  a_ftm: number;
  a_off_reb: number;
  a_pts: number;
  a_reb: number;
  a_secs_played: number;
  a_stl: number;
  a_three_fga: number;
  a_three_fgm: number;
  a_tov: number;
  a_two_fga: number;
  a_two_fgm: number;
  away_team_id: number;
  away_team_season_id: number;
  date: string;
  h_ast: number;
  h_blk: number;
  h_def_reb: number;
  h_fga: number;
  h_fgm: number;
  h_fouls: number;
  h_fta: number;
  h_ftm: number;
  h_off_reb: number;
  h_pts: number;
  h_reb: number;
  h_secs_played: number;
  h_stl: number;
  h_three_fga: number;
  h_three_fgm: number;
  h_tov: number;
  h_two_fga: number;
  h_two_fgm: number;
  home_team_id: number;
  home_team_season_id: number;
  id: Generated<number>;
  loser_id: number;
  season_id: number;
  season_type: string;
  winner_id: number;
}

export interface PlayerGameResult {
  ast: number;
  blk: number;
  date: string;
  def_reb: number;
  fga: number;
  fgm: number;
  fouls: number;
  fta: number;
  ftm: number;
  game_result_id: number;
  id: Generated<number>;
  off_reb: number;
  player_id: number;
  pts: number;
  reb: number;
  season_id: number;
  season_type: string;
  secs_played: number;
  stl: number;
  team_id: number;
  three_fga: number;
  three_fgm: number;
  tov: number;
  two_fga: number;
  two_fgm: number;
  win: number;
}

export interface PlayerInfo {
  age: number;
  career_status: string;
  experience: number;
  first_name: string;
  full_name: string;
  height: number;
  id: Generated<number>;
  is_starting: number;
  last_name: string;
  weight: number;
  wingspan: number;
}

export interface PlayerSeason {
  ast: number;
  blk: number;
  def_reb: number;
  fga: number;
  fgm: number;
  fouls: number;
  fta: number;
  ftm: number;
  games_played: number;
  games_started: number;
  id: Generated<number>;
  losses: number;
  off_reb: number;
  player_id: number;
  position: string;
  pts: number;
  reb: number;
  season_id: number;
  season_type: string;
  secs_played: number;
  stl: number;
  team_id: number;
  three_fga: number;
  three_fgm: number;
  tov: number;
  two_fga: number;
  two_fgm: number;
  wins: number;
}

export interface PlayerSkill {
  clutch_gene: number;
  defensive_iq: number;
  defensive_motor: number;
  defensive_rebounding: number;
  dribbling: number;
  driven: number;
  dunk: number;
  emotional: number;
  endurance: number;
  floater: number;
  free_throw: number;
  grit: number;
  handle_pressure: number;
  id: Generated<number>;
  inside: number;
  lateral_quickness: number;
  layup: number;
  leadership: number;
  mid_range: number;
  offensive_iq: number;
  offensive_motor: number;
  offensive_rebounding: number;
  passing: number;
  patience: number;
  player_id: number;
  playmaking: number;
  post: number;
  post_game: number;
  season_id: number;
  shiftiness: number;
  speed: number;
  step_back: number;
  streakiness: number;
  strength: number;
  team_id: number;
  tendency_above_the_break_three: number;
  tendency_catch_and_shoot: number;
  tendency_corner_three: number;
  tendency_defensive_rebounding: number;
  tendency_drive_to_basket: number;
  tendency_fadeaway: number;
  tendency_free_throw_drawing: number;
  tendency_mid_range: number;
  tendency_offensive_rebounding: number;
  tendency_paint: number;
  tendency_pass: number;
  tendency_pull_up: number;
  tendency_rim: number;
  tendency_score: number;
  tendency_step_back: number;
  three_point_catch_and_shoot: number;
  three_point_corner: number;
  three_point_deep: number;
  three_point_pull_up: number;
  three_point_step_back: number;
  turnaround: number;
  two_point_fadeaway: number;
  vertical_jump: number;
}

export interface Schedule {
  away_team_id: number;
  date: string;
  home_team_id: number;
  id: Generated<number>;
  is_processed: number;
  season_id: number;
  season_type: string;
}

export interface Season {
  end_year: number;
  id: Generated<number>;
  start_year: number;
}

export interface TeamInfo {
  abbreviation: string;
  city: string;
  conference: string;
  division: string;
  id: Generated<number>;
  name: string;
}

export interface TeamSeason {
  ast: number;
  away_losses: number;
  away_wins: number;
  blk: number;
  conference_losses: number;
  conference_rank: number;
  conference_wins: number;
  def_reb: number;
  division_losses: number;
  division_wins: number;
  fga: number;
  fgm: number;
  fouls: number;
  fta: number;
  ftm: number;
  games_played: number;
  home_losses: number;
  home_wins: number;
  id: Generated<number>;
  losses: number;
  off_reb: number;
  playoff_seed: number;
  pts: number;
  reb: number;
  season_id: number;
  secs_played: number;
  stl: number;
  team_id: number;
  three_fga: number;
  three_fgm: number;
  tov: number;
  two_fga: number;
  two_fgm: number;
  wins: number;
}

export interface DB {
  game_result: GameResult;
  player_game_result: PlayerGameResult;
  player_info: PlayerInfo;
  player_season: PlayerSeason;
  player_skill: PlayerSkill;
  schedule: Schedule;
  season: Season;
  team_info: TeamInfo;
  team_season: TeamSeason;
}
