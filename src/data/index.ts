import { playerSchemaSql, Player } from './schemas/player';
import { teamSchemaSql, Team } from './schemas/team';
import { teamSeasonSchemaSql, TeamSeason } from './schemas/teamSeason';
import { matchSchemaSql, Match } from './schemas/match';
import { PLAYER_TABLE, TEAM_TABLE, TEAM_SEASON_TABLE, MATCH_TABLE } from './constants';
import { SchemaTs, TableSchemaSql, isForeignKeyType } from './sqlTypes';

export {
  // Schema types
  SchemaTs,
  TableSchemaSql,
  Player,
  Team,
  TeamSeason,
  Match,
  // SQL
  playerSchemaSql,
  teamSchemaSql,
  teamSeasonSchemaSql,
  matchSchemaSql,
  isForeignKeyType,
  // Table names
  PLAYER_TABLE,
  TEAM_TABLE,
  TEAM_SEASON_TABLE,
  MATCH_TABLE,
};
