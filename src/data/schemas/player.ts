import { SchemaTs } from '../sqlTypes';
import { PlayerSeason } from './playerSeason';
import { PlayerSkills } from './playerSkills';
import { Season } from './season';

export const playerSchemaSql = {
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

export type PlayerRaw = SchemaTs<typeof playerSchemaSql>;

export type PlayerHistory = {
  playerInfo: PlayerRaw;
  regularSeasons?: PlayerSeason[];
  playoffSeasons?: PlayerSeason[];
  skills: PlayerSkills[];
};

export type Player = {
  playerInfo: PlayerRaw;
  season: Season;
  skills: PlayerSkills;
  regularSeason?: PlayerSeason;
  playoffSeason?: PlayerSeason;
};
