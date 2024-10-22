/*
* Simulate a basketball possession
*/

import { Player, Team } from '../../../data';

// Possession Event Types

type Assist = {
  type: 'assist';
  assister: Player;
  scorer: Player;
};

type Turnover = {
  type: 'turnover';
  player: Player;
  cause: 'bad pass' | 'steal' | 'offensive foul' | 'shot clock violation' | 'other';
};

type Foul = {
  type: 'foul';
  offender: Player;
  fouled: Player;
  foulType: 'personal' | 'technical' | 'flagrant';
};

type OutOfBoundsNonTurnover = {
  type: 'out_of_bounds';
  lastTouchedBy: Player;
};

type ShotAttempt = {
  shooter: Player;
  distance: number;
  defender: Player;
  contested: boolean;
  shotQualifier: ('step_back' | 'catch_and_shoot' | 'pull_up' | 'fadeaway' | 'heave' | 'deep')[];
  made: boolean;
};

type TwoPointShotAttempt = ShotAttempt & {
  type: 'two_point_shot_attempt';
  shotType: 'mid_range' | 'inside' | 'hook' | 'fadeaway' | 'layup' | 'dunk' | 'floater';
};

type ThreePointShotAttempt = ShotAttempt & {
  type: 'three_point_shot_attempt';
};

type FreeThrowShotAttempt = {
  type: 'free_throw_shot_attempt';
  shooter: Player;
  made: boolean;
};

type Steal = {
  type: 'steal';
  ballHandler: Player;
  stolenBy: Player;
};

type Block = {
  type: 'block';
  blocker: Player;
  shotAttempt: TwoPointShotAttempt | ThreePointShotAttempt;
};

type OffensiveRebound = {
  type: 'offensive_rebound';
  rebounder: Player;
};

type DefensiveRebound = {
  type: 'defensive_rebound';
  rebounder: Player;
};

type EndOfPeriod = {
  type: 'end_of_period';
  period: number;
};

type EndOfGame = {
  type: 'end_of_game';
};

type PossessionEvent =
  | Assist
  | Turnover
  | Foul
  | OutOfBoundsNonTurnover
  | TwoPointShotAttempt
  | ThreePointShotAttempt
  | FreeThrowShotAttempt
  | OffensiveRebound
  | DefensiveRebound
  | EndOfPeriod
  | EndOfGame
  | Steal
  | Block;

type Lineup = [Player, Player, Player, Player, Player];

type PossessionResult = {
  events: PossessionEvent[];
  offensiveTeam: Lineup;
  defensiveTeam: Lineup;
  timeLength: number;
};

type PossessionInput = {
  offensiveTeam: Lineup;
  defensiveTeam: Lineup;
  gameClock: number;
  period: number;
};

const simulatePossession = (input: PossessionInput): PossessionResult => {
  const { offensiveTeam, defensiveTeam, gameClock, period } = input;

  const events: PossessionEvent[] = [];

  return {
    events,
    offensiveTeam,
    defensiveTeam,
    timeLength: 0,
  };
};
