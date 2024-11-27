// import { playerSchemaSql, PlayerInfo, Player, PlayerHistory } from './schemas/player.js';
// import { playerSeasonSchemaSql, PlayerSeason } from './schemas/playerSeason.js';
// import { playerSkillsSchemaSql, PlayerSkills } from './schemas/playerSkills.js';
// import { teamSchemaSql, Lineup, TeamInfo, Team } from './schemas/team.js';
// import { teamSeasonSchemaSql, TeamSeason } from './schemas/teamSeason.js';
// import { seasonSchemaSql, Season } from './schemas/season.js';
// import { PlayerGameResult, playerGameResultSchemaSql } from './schemas/playerGameResult.js';
// import {
//   GameResult,
//   StatlineTeam,
//   StatlineRaw,
//   gameResultSchemaSql,
//   prefixKeys,
// } from './schemas/gameResult.js';
import db from './db.js';
import {
  PlayerInfo as PlayerInfoTable,
  PlayerSeason as PlayerSeasonTable,
  PlayerSkill as PlayerSkillTable,
  Season as SeasonTable,
  TeamSeason as TeamSeasonTable,
  TeamInfo as TeamInfoTable,
  GameResult as GameResultTable,
  PlayerGameResult as PlayerGameResultTable,
  DB as DBSchema,
} from './schema.js';
import {
  // Remapped to Selectable<myTable>
  PlayerInfo,
  PlayerSeason,
  PlayerSkill,
  Season,
  TeamSeason,
  TeamInfo,
  GameResult,
  PlayerGameResult,

  // Composed types
  PlayerHistory,
  Player,
  Lineup,
  Team,
  prefixKeys,
  StatlineRaw,
  StatlineTeam,
  PlayerEvent,
  GameStats,
  PossessionInput,
  PossessionResult,
} from './types.js';
import {
  PLAYER_TABLE,
  TEAM_TABLE,
  TEAM_SEASON_TABLE,
  PLAYER_SEASON_TABLE,
  PLAYER_SKILLS_TABLE,
  SEASON_TABLE,
  GAME_RESULT_TABLE,
  PLAYER_GAME_RESULT_TABLE,
} from './constants.js';

// import { InsertableRecord, SchemaTs, TableSchemaSql, isForeignKeyType } from './sqlTypes.js';

export type {
  // Base Table Types
  DBSchema,
  PlayerInfoTable,
  PlayerSeasonTable,
  PlayerSkillTable,
  SeasonTable,
  TeamSeasonTable,
  TeamInfoTable,
  GameResultTable,
  PlayerGameResultTable,

  // Selectable Types
  PlayerInfo,
  PlayerSeason,
  TeamInfo,
  TeamSeason,
  PlayerSkill,
  Season,
  GameResult,
  PlayerGameResult,

  // App Layer Types
  PlayerHistory,
  Player,
  Lineup,
  Team,
  StatlineRaw,
  StatlineTeam,
  PlayerEvent,
  GameStats,
  PossessionInput,
  PossessionResult,
};

export {
  // DB singleton
  db,

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
