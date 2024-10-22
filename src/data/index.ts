import { playerSchemaSql, PlayerRaw, Player } from './schemas/player';
import { playerSeasonSchemaSql, PlayerSeason } from './schemas/playerSeason';
import { teamSchemaSql, Team } from './schemas/team';
import { teamSeasonSchemaSql, TeamSeason } from './schemas/teamSeason';
import { matchSchemaSql, Match } from './schemas/match';
import { PLAYER_TABLE, TEAM_TABLE, TEAM_SEASON_TABLE, MATCH_TABLE, PLAYER_SEASON_TABLE } from './constants';
import { InsertableRecord, SchemaTs, TableSchemaSql, isForeignKeyType } from './sqlTypes';

export {
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

  // SQL
  playerSchemaSql,
  teamSchemaSql,
  teamSeasonSchemaSql,
  playerSeasonSchemaSql,
  matchSchemaSql,
  isForeignKeyType,

  // Table names
  PLAYER_TABLE,
  TEAM_TABLE,
  TEAM_SEASON_TABLE,
  MATCH_TABLE,
  PLAYER_SEASON_TABLE,
};
