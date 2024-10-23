import { SchemaTs } from '../sqlTypes';
import { PlayerSeason } from './playerSeason';

const playerSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',

  // Personal Info
  first_name: 'TEXT',
  last_name: 'TEXT',
  full_name: 'TEXT',

  // Physical Info
  age: 'REAL',
  height: 'REAL',
  weight: 'REAL',
  wingspan: 'REAL',

  // Career Info
  career_status: 'TEXT',
  experience: 'INTEGER',
} as const;

type PlayerRaw = SchemaTs<typeof playerSchemaSql>;

type Player = {
  playerInfo: PlayerRaw;
  regularSeasons: PlayerSeason[];
  playoffSeasons: PlayerSeason[];
  year: number;
};

export { playerSchemaSql, PlayerRaw, Player };
