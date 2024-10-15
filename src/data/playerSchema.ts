import { SchemaTs, TableSchemaSql } from './sqlTypes';

const playerSchemaSql: TableSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  first_name: 'TEXT',
  last_name: 'TEXT',
  full_name: 'TEXT',
  age: 'REAL',
  height: 'REAL',
  weight: 'REAL',
  team: 'TEXT',
  position: 'TEXT',
  status: 'TEXT',
  offensive_rating: 'REAL',
  defensive_rating: 'REAL',
  grit: 'REAL',
  leadership: 'REAL',
  experience: 'INTEGER',
} as const;

type playerSchema = SchemaTs<typeof playerSchemaSql>;

export { playerSchemaSql, playerSchema };
