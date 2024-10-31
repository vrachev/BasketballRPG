import { playerSchemaSql, PlayerRaw, Player } from './schemas/player';
import { playerSeasonSchemaSql, PlayerSeason } from './schemas/playerSeason';
import { playerSkillsSchemaSql, PlayerSkills } from './schemas/playerSkills';
import { teamSchemaSql, Team } from './schemas/team';
import { teamSeasonSchemaSql, TeamSeason } from './schemas/teamSeason';
import { matchSchemaSql, Match } from './schemas/match';
import {
  PLAYER_TABLE,
  TEAM_TABLE,
  TEAM_SEASON_TABLE,
  MATCH_TABLE,
  PLAYER_SEASON_TABLE,
  PLAYER_SKILLS_TABLE
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
  Team,
  TeamSeason,
  Match,
  PlayerSkills,
};

export {
  // SQL
  playerSchemaSql,
  teamSchemaSql,
  teamSeasonSchemaSql,
  playerSeasonSchemaSql,
  playerSkillsSchemaSql,
  matchSchemaSql,
  isForeignKeyType,

  // Table names
  PLAYER_TABLE,
  TEAM_TABLE,
  TEAM_SEASON_TABLE,
  MATCH_TABLE,
  PLAYER_SEASON_TABLE,
  PLAYER_SKILLS_TABLE,
};
