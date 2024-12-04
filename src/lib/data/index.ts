import getDb from './db.js';
import type {
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
import type {
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

import { prefixKeys } from './types.js';

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
  getDb,

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
