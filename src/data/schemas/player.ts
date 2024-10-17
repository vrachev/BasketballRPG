import { SchemaTs, ForeignKeyType } from '../sqlTypes';

const playerSchemaSql = {
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
  team_id: 'INTEGER',
  teamKey: ['team_id', 'teams', 'id'] as ForeignKeyType
} as const;

type Player = SchemaTs<typeof playerSchemaSql>;

export { playerSchemaSql, Player };
