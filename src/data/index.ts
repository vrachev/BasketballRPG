import { playerSchemaSql, playerSchema } from './schemas/playerSchema';
import { teamSchemaSql, teamSchema } from './schemas/teamSchema';
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
