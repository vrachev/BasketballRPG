import { playerSchemaSql, PlayerInfo, Player } from './schemas/player';
import { playerSeasonSchemaSql, PlayerSeason } from './schemas/playerSeason';
import { playerSkillsSchemaSql, PlayerSkills } from './schemas/playerSkills';
import { teamSchemaSql, Lineup, TeamInfo, Team } from './schemas/team';
import { teamSeasonSchemaSql, TeamSeason } from './schemas/teamSeason';
import { seasonSchemaSql, Season } from './schemas/season';
import { PlayerGameResult, playerGameResultSchemaSql } from './schemas/playerGameResult';
import {
  GameResult,
  StatlineTeam,
  StatlineRaw,
  StatlineAdvancedTeam,
  gameResultSchemaSql,
  prefixKeys,
} from './schemas/gameResult';
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
  PlayerInfo,
  Player,
  PlayerSeason,
  Lineup,
  TeamInfo,
  Team,
  TeamSeason,
  PlayerSkills,
  Season,
  StatlineRaw,
  StatlineAdvancedTeam,
  StatlineTeam,
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
