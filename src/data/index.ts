import { playerSchemaSql, playerSchema } from './schemas/player';
import { teamSchemaSql, teamSchema } from './schemas/team';
import { teamSeasonSchemaSql, teamSeasonSchema } from './schemas/teamSeason';
import { matchSchemaSql, matchSchema } from './schemas/match';
import { PLAYER_TABLE, TEAM_TABLE, TEAM_SEASON_TABLE, MATCH_TABLE } from './constants';
import { SchemaTs, TableSchemaSql, isForeignKeyType } from './sqlTypes';

export {
  // Schema types
  SchemaTs,
  TableSchemaSql,
  playerSchema,
  teamSchema,
  teamSeasonSchema,
  matchSchema,
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
