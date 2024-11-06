import { playerSchemaSql, PlayerRaw, Player } from './schemas/player';
import { playerSeasonSchemaSql, PlayerSeason } from './schemas/playerSeason';
import { playerSkillsSchemaSql, PlayerSkills } from './schemas/playerSkills';
import { playerGameResultSchemaSql, PlayerStatline, PlayerGameResult } from './schemas/playerGameResult';
import { teamSchemaSql, TeamRaw, Team } from './schemas/team';
import { teamSeasonSchemaSql, TeamSeason } from './schemas/teamSeason';
import { seasonSchemaSql, Season } from './schemas/season';
import { prefixKeys, gameResultSchemaSql, TeamGameStats, GameResult } from './schemas/gameResult';
import {
  PLAYER_TABLE,
  TEAM_TABLE,
  TEAM_SEASON_TABLE,
  PLAYER_SEASON_TABLE,
  PLAYER_SKILLS_TABLE,
  SEASON_TABLE,
  GAME_RESULT_TABLE,
  PLAYER_GAME_RESULT_TABLE,
} from './constants';
import { InsertableRecord, SchemaTs, TableSchemaSql, isForeignKeyType } from './sqlTypes';

export type {
  // Schema helpers
  SchemaTs,
  TableSchemaSql,
  InsertableRecord,

  // Typescript types
  PlayerRaw,
  Player,
  PlayerSeason,
  TeamRaw,
  Team,
  TeamSeason,
  TeamGameStats,
  PlayerSkills,
  Season,
  PlayerStatline,
  PlayerGameResult,
  GameResult,
};

export {
  // SQL
  playerSchemaSql,
  teamSchemaSql,
  teamSeasonSchemaSql,
  playerSeasonSchemaSql,
  playerSkillsSchemaSql,
  playerGameResultSchemaSql,
  seasonSchemaSql,
  gameResultSchemaSql,
  isForeignKeyType,

  // Helper functions
  prefixKeys,

  // Table names
  PLAYER_TABLE,
  TEAM_TABLE,
  TEAM_SEASON_TABLE,
  PLAYER_SEASON_TABLE,
  PLAYER_SKILLS_TABLE,
  SEASON_TABLE,
  GAME_RESULT_TABLE,
  PLAYER_GAME_RESULT_TABLE,
};
