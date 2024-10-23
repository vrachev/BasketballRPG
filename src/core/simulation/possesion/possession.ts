/*
* Simulate a basketball possession
*/

import { Player, Team } from '../../../data';
import { Lineup } from '../..';
import { possessionConstants, averageGameStatsPerTeam } from '../..';

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
  shotClock: number;
  period: number;
};

export const simulatePossession = (input: PossessionInput): PossessionResult => {
  const { offensiveTeam, defensiveTeam, gameClock, shotClock, period } = input;

  const events: PossessionEvent[] = [];

  return {
    events,
    offensiveTeam,
    defensiveTeam,
    timeLength: 0,
  };
};

export const pickShooter = (shotTendencies: number[]) => {
  const totalTendency = shotTendencies.reduce((sum, tendency) => sum + tendency, 0);
  const randomValue = Math.random() * totalTendency;
  let cumulativeTendency = 0;

  if (randomValue >= totalTendency) {
    return shotTendencies.length - 1;
  }

  for (let i = 0; i < shotTendencies.length; i++) {
    cumulativeTendency += shotTendencies[i];
    if (randomValue <= cumulativeTendency) {
      return i;
    }
  }

  throw new Error(`randomValue is out of bounds: ${randomValue}, totalTendency: ${totalTendency}`);
};

const determineShot = (player: Player, passer: Player) => {

};


// Also export the types if they're not already exported
export type { PossessionInput, PossessionResult, PossessionEvent };
