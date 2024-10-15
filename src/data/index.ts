import { playerSchemaSql, playerSchema } from './playerSchema';
import { teamSchemaSql, teamSchema } from './teamSchema';
import { PLAYER_TABLE, TEAM_TABLE } from './constants';
import { SchemaTs, TableSchemaSql } from './sqlTypes';

export {
  // Schema types
  SchemaTs,
  TableSchemaSql,
  playerSchema,
  teamSchema,
  // SQL
  playerSchemaSql,
  teamSchemaSql,
  // Table names
  PLAYER_TABLE,
  TEAM_TABLE
};
