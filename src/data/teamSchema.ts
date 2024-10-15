import { SchemaTs, TableSchemaSql } from './sqlTypes';

const teamSchemaSql: TableSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  name: 'TEXT',
  city: 'TEXT',
  mascot: 'TEXT',
  conference: 'TEXT',
  division: 'TEXT',
  wins: 'INTEGER',
  losses: 'INTEGER',
  ranking: 'REAL',
  offensive_rating: 'REAL',
  defensive_rating: 'REAL',
  team_chemistry: 'REAL',
  fan_support: 'REAL',
  budget: 'REAL',
} as const;

type teamSchema = SchemaTs<typeof teamSchemaSql>;

export { teamSchemaSql, teamSchema };
