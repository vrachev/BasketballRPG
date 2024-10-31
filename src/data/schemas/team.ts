import { SchemaTs } from "../sqlTypes";

export const teamSchemaSql = {
  id: "INTEGER PRIMARY KEY AUTOINCREMENT",
  name: "TEXT",
  city: "TEXT",
  abbreviation: "TEXT",
  conference: "TEXT",
  division: "TEXT",
} as const;

export type Team = SchemaTs<typeof teamSchemaSql>;
