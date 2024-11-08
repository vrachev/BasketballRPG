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

export type TeamInfo = SchemaTs<typeof teamSchemaSql>;

export type Lineup = [Player, Player, Player, Player, Player];

export type Team = {
  teamInfo: TeamInfo;
  teamSeason: TeamSeason;
  players: Player[];
  startingLineup: Lineup;
};
