import { SchemaTs } from "../sqlTypes";
import { Player } from "./player";
import { TeamSeason } from "./teamSeason";

export const teamSchemaSql = {
  id: "INTEGER PRIMARY KEY AUTOINCREMENT",
  name: "TEXT",
  city: "TEXT",
  abbreviation: "TEXT",
  conference: "TEXT",
  division: "TEXT",
} as const;

export type TeamRaw = SchemaTs<typeof teamSchemaSql>;

export type Team = {
  teamInfo: TeamRaw;
  teamSeason: TeamSeason;
  players: Player[];
};
