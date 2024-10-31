import {
  PlayerRaw,
  PlayerSeason,
  PlayerSkills,
  PLAYER_SEASON_TABLE,
  PLAYER_SKILLS_TABLE,
  PLAYER_TABLE
} from '../../data';
import { InsertableRecord } from '../../data/sqlTypes';
import { insert, openDb } from '../../db';
import { Player, PlayerHistory } from '@src/data/schemas/player';

type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
type SeasonType = 'regular_season' | 'playoffs';

export const generatePlayerSkills = (
  pid: number,
  year: number,
  teamId: number,
  defaultSkillLevel: number,
  defaultTendencyLevel: number,
  insertableFields: Partial<PlayerSkills> = {}
): InsertableRecord<PlayerSkills> => {
  const skillDefaults = {
    player_id: pid,
    team_id: teamId,
    year: year,

    // Physical Skills
    strength: defaultSkillLevel,
    speed: defaultSkillLevel,
    lateral_quickness: defaultSkillLevel,
    shiftiness: defaultSkillLevel,
    vertical_jump: defaultSkillLevel,
    endurance: defaultSkillLevel,

    // Shooting Skills
    free_throw: defaultSkillLevel,
    inside: defaultSkillLevel,
    layup: defaultSkillLevel,
    dunk: defaultSkillLevel,
    floater: defaultSkillLevel,
    turnaround: defaultSkillLevel,
    post: defaultSkillLevel,
    step_back: defaultSkillLevel,
    mid_range: defaultSkillLevel,
    two_point_fadeaway: defaultSkillLevel,
    three_point_catch_and_shoot: defaultSkillLevel,
    three_point_corner: defaultSkillLevel,
    three_point_step_back: defaultSkillLevel,
    three_point_pull_up: defaultSkillLevel,
    three_point_deep: defaultSkillLevel,

    // IQ
    offensive_iq: defaultSkillLevel,
    defensive_iq: defaultSkillLevel,
    patience: defaultSkillLevel,

    // Intangibles
    grit: defaultSkillLevel,
    leadership: defaultSkillLevel,
    clutch_gene: defaultSkillLevel,
    offensive_motor: defaultSkillLevel,
    defensive_motor: defaultSkillLevel,
    streakiness: defaultSkillLevel,
    handle_pressure: defaultSkillLevel,
    driven: defaultSkillLevel,
    emotional: defaultSkillLevel,

    // Basketball skills
    dribbling: defaultSkillLevel,
    playmaking: defaultSkillLevel,
    passing: defaultSkillLevel,
    offensive_rebounding: defaultSkillLevel,
    defensive_rebounding: defaultSkillLevel,
    post_game: defaultSkillLevel,

    // Tendencies
    tendency_pass: defaultTendencyLevel,
    tendency_score: defaultTendencyLevel,
    tendency_catch_and_shoot: defaultTendencyLevel,
    tendency_pull_up: defaultTendencyLevel,
    tendency_step_back: defaultTendencyLevel,
    tendency_fadeaway: defaultTendencyLevel,
    tendency_mid_range: defaultTendencyLevel,
    tendency_corner_three: defaultTendencyLevel,
    tendency_above_the_break_three: defaultTendencyLevel,
    tendency_drive_to_basket: defaultTendencyLevel,
    tendency_rim: defaultTendencyLevel,
    tendency_paint: defaultTendencyLevel,
    tendency_free_throw_drawing: defaultTendencyLevel,
    tendency_offensive_rebounding: defaultTendencyLevel,
    tendency_defensive_rebounding: defaultTendencyLevel
  };

  return { ...skillDefaults, ...insertableFields };
};

const generatePlayerSeason = (
  playerId: number,
  teamId: number,
  year: number,
  position: Position,
  seasonType: SeasonType
): InsertableRecord<PlayerSeason> => {
  const playerSeason: InsertableRecord<PlayerSeason> = {
    // Foreign keys
    player_id: playerId,
    team_id: teamId,
    year: year,
    season_type: seasonType,
    position: position,

    // Base stats
    games_played: 0,
    games_started: 0,
    minutes_played: 0,
    field_goals_made: 0,
    field_goals_attempted: 0,
    field_goals_percentage: 0,
    three_point_field_goals_made: 0,
    three_point_field_goals_attempted: 0,
    three_point_field_goals_percentage: 0,
    two_point_field_goals_made: 0,
    two_point_field_goals_attempted: 0,
    two_point_field_goals_percentage: 0,
    effective_field_goal_percentage: 0,
    free_throws_made: 0,
    free_throws_attempted: 0,
    free_throws_percentage: 0,
    offensive_rebounds: 0,
    defensive_rebounds: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
    points: 0
  };
  return playerSeason;
};

export const createPlayer = async (
  playerInfo: InsertableRecord<PlayerRaw>,
  teamId: number,
  playerSkills: InsertableRecord<PlayerSkills>,
  currentYear: number,
  position: Position
): Promise<number> => {
  const playerId = await insert(playerInfo, PLAYER_TABLE);
  const playerSeasonRegular = generatePlayerSeason(playerId, teamId, currentYear, position, 'regular_season');
  const playerSeasonPlayoffs = generatePlayerSeason(playerId, teamId, currentYear, position, 'playoffs');
  await insert(playerSkills, PLAYER_SKILLS_TABLE);
  await insert(playerSeasonRegular, PLAYER_SEASON_TABLE);
  await insert(playerSeasonPlayoffs, PLAYER_SEASON_TABLE);
  return playerId;
};

export const getPlayerHistory = async (playerId: number, currentYear: number): Promise<PlayerHistory> => {
  const db = await openDb();
  const playerData = await db.get<PlayerRaw>(`SELECT * FROM ${PLAYER_TABLE} WHERE id = ?`, [playerId]);
  const regularSeasons = await db.all<PlayerSeason[]>(`SELECT * FROM ${PLAYER_SEASON_TABLE} WHERE player_id = ? AND season_type = 'regular_season'`, [playerId]);
  const playoffSeasons = await db.all<PlayerSeason[]>(`SELECT * FROM ${PLAYER_SEASON_TABLE} WHERE player_id = ? AND season_type = 'playoffs'`, [playerId]);
  const skills = await db.all<PlayerSkills[]>(`SELECT * FROM ${PLAYER_SKILLS_TABLE} WHERE player_id = ?`, [playerId]);
  if (!playerData) {
    throw new Error(`Player with id ${playerId} not found`);
  }
  const playerHistory: PlayerHistory = {
    playerInfo: playerData,
    regularSeasons: regularSeasons,
    playoffSeasons: playoffSeasons,
    skills: skills,
    year: currentYear,
  };
  return playerHistory;
};

export const getPlayerFromHistory = (history: PlayerHistory): Player => {
  const { playerInfo, year } = history;

  // Find skills for the given year
  const skills = history.skills.find(s => s.year === year);
  if (!skills) {
    throw new Error(`No skills found for player ${playerInfo.id} in year ${year}`);
  }

  // Find seasons for the given year
  const regularSeason = history.regularSeasons?.find(s => s.year === year);
  const playoffSeason = history.playoffSeasons?.find(s => s.year === year);

  return {
    playerInfo,
    year,
    skills,
    regularSeason,
    playoffSeason,
  };
};
