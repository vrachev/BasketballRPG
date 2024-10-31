import { SchemaTs } from "../sqlTypes";

const teamSchemaSql = {
  id: "INTEGER PRIMARY KEY AUTOINCREMENT",
  name: "TEXT",
  city: "TEXT",
  abbreviation: "TEXT",
  conference: "TEXT",
  division: "TEXT",
} as const;

type Team = SchemaTs<typeof teamSchemaSql>;

export { teamSchemaSql, Team };
