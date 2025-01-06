import type { Selectable } from 'kysely';
import type {
  PlayerInfo as PlayerInfoTable,
  PlayerSeason as PlayerSeasonTable,
  PlayerSkill as PlayerSkillTable,
  Season as SeasonTable,
  TeamSeason as TeamSeasonTable,
  TeamInfo as TeamInfoTable,
  GameResult as GameResultTable,
  PlayerGameResult as PlayerGameResultTable,
  Schedule as ScheduleTable,
} from './schema.js';

export type PlayerInfo = Selectable<PlayerInfoTable>;
export type PlayerSeason = Selectable<PlayerSeasonTable>;
export type PlayerSkill = Selectable<PlayerSkillTable>;
export type Season = Selectable<SeasonTable>;
export type TeamSeason = Selectable<TeamSeasonTable>;
export type TeamInfo = Selectable<TeamInfoTable>;
export type GameResult = Selectable<GameResultTable>;
export type PlayerGameResult = Selectable<PlayerGameResultTable>;
export type Schedule = Selectable<ScheduleTable>;
// Player Types

export type PlayerHistory = {
  playerInfo: PlayerInfo;
  regularSeasons?: PlayerSeason[];
  playoffSeasons?: PlayerSeason[];
  skills: PlayerSkill[];
};

export type Player = {
  playerInfo: PlayerInfo;
  season: Season;
  skills: PlayerSkill;
  regularSeason?: PlayerSeason;
  playoffSeason?: PlayerSeason;
};

export type PlayerEvent = StatlineRaw & {
  pid: number;
};

// Team Types

export type Lineup = [Player, Player, Player, Player, Player];

export type Team = {
  teamInfo: TeamInfo;
  teamSeason: TeamSeason;
  players: Player[];
  startingLineup: Lineup;
};

// Game Result Types

// Helper function to prefix all keys in an object
export const prefixKeys = <T extends Record<string, any>>(obj: T, prefix: string) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [`${prefix}${key}`, value])
  ) as { [K in keyof T as `${typeof prefix}${string & K}`]: T[K] };
};

// hardcode bc I'm on a plane and can't figure out how to do it the right way.
export type StatlineRaw = {
  secs_played: number;
  fga: number;
  fgm: number;
  two_fga: number;
  two_fgm: number;
  three_fga: number;
  three_fgm: number;
  ftm: number;
  fta: number;
  off_reb: number;
  def_reb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fouls: number;
  pts: number;
};

export type StatlineTeam = StatlineRaw;

export type GameStats = {
  homeTeam: Team;
  awayTeam: Team;
  homeTeamStatline: StatlineTeam;
  awayTeamStatline: StatlineTeam;
  homePlayerStats: PlayerEvent[];
  awayPlayerStats: PlayerEvent[];
  winner: 'home' | 'away';
};

// Possession Types

export type PossessionInput = {
  offensiveLineup: Lineup;
  defensiveLineup: Lineup;
  period: number;
  gameClock: number;
};

export type PossessionResult = {
  playerEvents: PlayerEvent[];
  possessionChange: boolean;
  timeLength: number;
};
