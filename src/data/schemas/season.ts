import { SchemaTs } from '../sqlTypes';

export const seasonSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  start_year: 'INTEGER',
  end_year: 'INTEGER',
} as const;

export type Season = SchemaTs<typeof seasonSchemaSql>;
