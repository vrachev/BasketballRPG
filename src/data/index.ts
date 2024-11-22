// import { playerSchemaSql, PlayerInfo, Player, PlayerHistory } from './schemas/player';
// import { playerSeasonSchemaSql, PlayerSeason } from './schemas/playerSeason';
// import { playerSkillsSchemaSql, PlayerSkills } from './schemas/playerSkills';
// import { teamSchemaSql, Lineup, TeamInfo, Team } from './schemas/team';
// import { teamSeasonSchemaSql, TeamSeason } from './schemas/teamSeason';
// import { seasonSchemaSql, Season } from './schemas/season';
// import { PlayerGameResult, playerGameResultSchemaSql } from './schemas/playerGameResult';
// import {
//   GameResult,
//   StatlineTeam,
//   StatlineRaw,
//   gameResultSchemaSql,
//   prefixKeys,
// } from './schemas/gameResult';
import db from './db';
import {
  PlayerInfo as PlayerInfoTable,
  PlayerSeason as PlayerSeasonTable,
  PlayerSkill as PlayerSkillTable,
  Season as SeasonTable,
  TeamSeason as TeamSeasonTable,
  TeamInfo as TeamInfoTable,
  GameResult as GameResultTable,
  PlayerGameResult as PlayerGameResultTable,
} from './schema';
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
} from './types';
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

// import { InsertableRecord, SchemaTs, TableSchemaSql, isForeignKeyType } from './sqlTypes';

export type {
  // Base Table Types
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
