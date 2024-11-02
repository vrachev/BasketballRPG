import { playerSchemaSql, PlayerRaw, Player } from './schemas/player';
import { playerSeasonSchemaSql, PlayerSeason } from './schemas/playerSeason';
import { playerSkillsSchemaSql, PlayerSkills } from './schemas/playerSkills';
import { teamSchemaSql, Team } from './schemas/team';
import { teamSeasonSchemaSql, TeamSeason } from './schemas/teamSeason';
import { seasonSchemaSql, Season } from './schemas/season';
import {
  PLAYER_TABLE,
  TEAM_TABLE,
  TEAM_SEASON_TABLE,
  PLAYER_SEASON_TABLE,
  PLAYER_SKILLS_TABLE,
  SEASON_TABLE,
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
  PlayerSkills,
  Season,
};

export {
  // SQL
  playerSchemaSql,
  teamSchemaSql,
  teamSeasonSchemaSql,
  playerSeasonSchemaSql,
  playerSkillsSchemaSql,
  seasonSchemaSql,
  isForeignKeyType,

  // Table names
  PLAYER_TABLE,
  TEAM_TABLE,
  TEAM_SEASON_TABLE,
  PLAYER_SEASON_TABLE,
  PLAYER_SKILLS_TABLE,
  SEASON_TABLE,
};
