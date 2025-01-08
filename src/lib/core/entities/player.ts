import {
  PLAYER_SEASON_TABLE,
  PLAYER_SKILLS_TABLE,
  PLAYER_TABLE,
  type PlayerSeasonTable,
  type PlayerSkillTable,
  type PlayerInfoTable,
  type PlayerHistory,
  type Player,
  getDb,
} from "../../data/index.js";
import type { Insertable } from "kysely";
import { getSeason } from "./season.js";
import { Chance } from "chance";
import { logger } from "$lib/logger.js";

type Position = "PG" | "SG" | "SF" | "PF" | "C";
type SeasonType = "regular_season" | "playoffs";

type PlayerInfoInput = {
  firstName?: string;
  lastName?: string;
  age?: number;
  height?: number;
  weight?: number;
  wingspan?: number;
  isStarting?: boolean;
};

// Initialize chance
const chance = new Chance();

const generatePlayerInfo = (
  input: PlayerInfoInput,
): Insertable<PlayerInfoTable> => {
  const firstName = input.firstName || chance.first({ gender: "male" });
  const lastName = input.lastName || chance.last();
  const fullName = `${firstName} ${lastName}`;

  const player: Insertable<PlayerInfoTable> = {
    // Personal Info
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,

    // Physical Info
    age: input.age || 25,
    height: input.height || 78,
    weight: input.weight || 200,
    wingspan: input.wingspan || 78,

    // Career Info
    career_status: "Active",
    experience: 0,
    is_starting: input.isStarting ? 1 : 0,
  };

  return player;
};

const generatePlayerSkills = (
  pid: number,
  seasonId: number,
  teamId: number,
  defaultSkillLevel: number,
  defaultTendencyLevel: number,
  insertableFields: Partial<Insertable<PlayerSkillTable>> = {},
): Insertable<PlayerSkillTable> => {
  const skillDefaults = {
    player_id: pid,
    team_id: teamId,
    season_id: seasonId,

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
    tendency_defensive_rebounding: defaultTendencyLevel,
  };

  const playerSkills: Insertable<PlayerSkillTable> = {
    ...skillDefaults,
    ...insertableFields,
  };
  return playerSkills;
};

const generatePlayerSeason = (
  playerId: number,
  teamId: number,
  seasonId: number,
  position: Position,
  seasonType: SeasonType,
): Insertable<PlayerSeasonTable> => {
  const playerSeason: Insertable<PlayerSeasonTable> = {
    // Keys
    player_id: playerId,
    team_id: teamId,
    season_id: seasonId,
    season_type: seasonType,
    position: position,

    // Stats
    games_played: 0,
    games_started: 0,
    wins: 0,
    losses: 0,

    // Raw Totals
    secs_played: 0,
    fga: 0,
    fgm: 0,
    two_fga: 0,
    two_fgm: 0,
    three_fga: 0,
    three_fgm: 0,
    fta: 0,
    ftm: 0,
    off_reb: 0,
    def_reb: 0,
    reb: 0,
    ast: 0,
    stl: 0,
    blk: 0,
    tov: 0,
    fouls: 0,
    pts: 0,
  };
  return playerSeason;
};

export type CreatePlayerInput = {
  playerInfoInput: PlayerInfoInput;
  teamId: number;
  position: Position;
  defaultSkillLevel: number;
  defaultTendencyLevel: number;
  overrideSkills?: Partial<Insertable<PlayerSkillTable>>;
};

export const createPlayers = async (
  inputs: CreatePlayerInput[],
  seasonStartingYear: number,
): Promise<number[]> => {
  const db = await getDb();

  const playerInfoBatch: Insertable<PlayerInfoTable>[] = [];
  let playerSkillsBatch: Insertable<PlayerSkillTable>[] = [];
  let playerSeasonRegularBatch: Insertable<PlayerSeasonTable>[] = [];
  let playerSeasonPlayoffsBatch: Insertable<PlayerSeasonTable>[] = [];

  const seasonId = (await getSeason(seasonStartingYear))?.id;
  if (!seasonId) {
    throw new Error(`Season ${seasonStartingYear} not found.`);
  }

  for (const { playerInfoInput } of inputs) {
    const playerInfo = generatePlayerInfo(playerInfoInput);
    playerInfoBatch.push(playerInfo);
  }

  // First we insert PlayerInfo to get PID for other tables
  const insertedPlayers = await db
    .insertInto(PLAYER_TABLE)
    .values(playerInfoBatch)
    .returning("id")
    .execute();

  for (const [idx, input] of inputs.entries()) {
    const {
      teamId,
      position,
      defaultSkillLevel,
      defaultTendencyLevel,
      overrideSkills,
    } = input;
    const pid = insertedPlayers[idx].id;

    // Dependent data
    const playerSkills = generatePlayerSkills(
      pid,
      seasonId,
      teamId,
      defaultSkillLevel,
      defaultTendencyLevel,
      overrideSkills,
    );
    const playerSeasonRegular = generatePlayerSeason(
      pid,
      teamId,
      seasonId,
      position,
      "regular_season",
    );
    const playerSeasonPlayoffs = generatePlayerSeason(
      pid,
      teamId,
      seasonId,
      position,
      "playoffs",
    );

    playerSkillsBatch.push(playerSkills);
    playerSeasonRegularBatch.push(playerSeasonRegular);
    playerSeasonPlayoffsBatch.push(playerSeasonPlayoffs);
  }

  await db.insertInto(PLAYER_SKILLS_TABLE).values(playerSkillsBatch).execute();

  await db
    .insertInto(PLAYER_SEASON_TABLE)
    .values(playerSeasonRegularBatch)
    .execute();

  await db
    .insertInto(PLAYER_SEASON_TABLE)
    .values(playerSeasonPlayoffsBatch)
    .execute();

  return insertedPlayers.map((player) => player.id);
};

export const getPlayerHistories = async (
  playerIds: number[],
): Promise<Map<number, PlayerHistory>> => {
  const db = await getDb();

  const playersData = await db
    .selectFrom(PLAYER_TABLE)
    .selectAll()
    .where("id", "in", playerIds)
    .execute();

  const missingIds = playerIds.filter(
    (id) => !playersData.some((player) => player.id === id),
  );
  if (missingIds.length > 0) {
    throw new Error(`Players with IDs ${missingIds.join(", ")} not found`);
  }

  const regularSeasons = await db
    .selectFrom(PLAYER_SEASON_TABLE)
    .selectAll()
    .where("player_id", "in", playerIds)
    .where("season_type", "=", "regular_season")
    .execute();

  const playoffSeasons = await db
    .selectFrom(PLAYER_SEASON_TABLE)
    .selectAll()
    .where("player_id", "in", playerIds)
    .where("season_type", "=", "playoffs")
    .execute();

  const skillsData = await db
    .selectFrom(PLAYER_SKILLS_TABLE)
    .selectAll()
    .where("player_id", "in", playerIds)
    .execute();

  const regularSeasonsByPlayer = groupBy(regularSeasons, "player_id");
  const playoffSeasonsByPlayer = groupBy(playoffSeasons, "player_id");
  const skillsByPlayer = groupBy(skillsData, "player_id");

  const playerHistories = new Map<number, PlayerHistory>();
  for (const player of playersData) {
    const playerId = player.id;
    playerHistories.set(playerId, {
      playerInfo: player,
      regularSeasons: regularSeasonsByPlayer[String(playerId)] || [],
      playoffSeasons: playoffSeasonsByPlayer[String(playerId)] || [],
      skills: skillsByPlayer[String(playerId)] || [],
    });
  }

  return playerHistories;
};

export const getPlayersFromHistories = async (
  histories: PlayerHistory[],
  seasonStartingYear: number,
): Promise<Player[]> => {
  const db = await getDb();

  // Fetch the season data for the given starting year
  const season = await getSeason(seasonStartingYear);
  if (!season) {
    throw new Error(`Season with year ${seasonStartingYear} not found`);
  }

  // Extract all player IDs from the histories
  const playerIds = histories.map((history) => history.playerInfo.id);

  // Fetch all skills for the given season and player IDs in a batch
  const skillsData = await db
    .selectFrom(PLAYER_SKILLS_TABLE)
    .selectAll()
    .where("season_id", "=", season.id)
    .where("player_id", "in", playerIds)
    .execute();

  // Fetch all regular and playoff seasons for the given season and player IDs in a batch
  const regularSeasonsData = await db
    .selectFrom(PLAYER_SEASON_TABLE)
    .selectAll()
    .where("season_id", "=", season.id)
    .where("season_type", "=", "regular_season")
    .where("player_id", "in", playerIds)
    .execute();

  const playoffSeasonsData = await db
    .selectFrom(PLAYER_SEASON_TABLE)
    .selectAll()
    .where("season_id", "=", season.id)
    .where("season_type", "=", "playoffs")
    .where("player_id", "in", playerIds)
    .execute();

  // Group fetched data by player ID
  const skillsByPlayer = groupBy(skillsData, "player_id");
  const regularSeasonsByPlayer = groupBy(regularSeasonsData, "player_id");
  const playoffSeasonsByPlayer = groupBy(playoffSeasonsData, "player_id");

  // Construct Player objects
  const players: Player[] = histories.map((history) => {
    const { playerInfo } = history;
    const playerId = playerInfo.id;

    const skills = skillsByPlayer[String(playerId)]?.[0]; // Each player should have one skill entry per season
    if (!skills) {
      throw new Error(
        `No skills found for player ${playerId} in year ${season.start_year}`,
      );
    }

    const regularSeason = regularSeasonsByPlayer[String(playerId)]?.[0];
    const playoffSeason = playoffSeasonsByPlayer[String(playerId)]?.[0];

    return {
      playerInfo,
      season,
      skills,
      regularSeason,
      playoffSeason,
    };
  });

  return players;
};

function groupBy<T, K extends keyof T>(
  array: T[],
  key: K,
): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const groupKey = String(item[key]);
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}
