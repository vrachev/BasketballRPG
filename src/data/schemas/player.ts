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

  // I have this here as it is easiest.
  // We record starting/bench statistics elsewhere, so we're not losing any info.
  // This will get updated as a player is benched or put in the starting lineup.
  // 0 is not starting, 1 is starting
  is_starting: 'INTEGER',
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
