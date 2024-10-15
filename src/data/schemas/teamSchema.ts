import { SchemaTs, TableSchemaSql } from '../sqlTypes';

const teamSchemaSql: TableSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  name: 'TEXT',
  city: 'TEXT',
  mascot: 'TEXT',
  conference: 'TEXT',
  division: 'TEXT',
} as const;

type teamSchema = SchemaTs<typeof teamSchemaSql>;

export { teamSchemaSql, teamSchema };
