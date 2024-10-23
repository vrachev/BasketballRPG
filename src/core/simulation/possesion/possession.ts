/*
* Simulate a basketball possession
*/

import { Player, Team } from '../../../data';
import { Lineup } from '../..';
import { possessionConstants, averageGameStatsPerTeam, playerConstants } from '../..';

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

// basic function for now. We can add more sophisticated logic later, eg: clutch time
export const pickOption = (ratios: number[]) => {
  const totalOdds = ratios.reduce((sum, tendency) => sum + tendency, 0);
  const randomValue = Math.random() * totalOdds;
  let cumulativeOdds = 0;

  if (randomValue >= totalOdds) {
    return ratios.length - 1;
  }

  for (let i = 0; i < ratios.length; i++) {
    cumulativeOdds += ratios[i];
    if (randomValue <= cumulativeOdds) {
      return i;
    }
  }

  throw new Error(`randomValue is out of bounds: ${randomValue}, totalTendency: ${totalOdds}`);
};

export const determineAssist = (players: Player[]) => {
  const numPlayers = players.length;
  const assistPercentage = averageGameStatsPerTeam.assistPercentage;
  const leagueAverageSkill = playerConstants.leagueAverageSkill;

  const oddsNoAssists = (
    assistPercentage *
    numPlayers *
    leagueAverageSkill
  ) / (1 - assistPercentage);
  const optionPicked = pickOption([...players.map(player => player.skills.passing), oddsNoAssists]);

  const passer = optionPicked < numPlayers ? players[optionPicked] : null;
  return passer;
};

export const determineShot = (players: Player[]) => {
  const shooter = players[pickOption(players.map(player => player.skills.tendency_score))];
  const assister = determineAssist(players.filter(player => player !== shooter));

};


// Also export the types if they're not already exported
export type { PossessionInput, PossessionResult, PossessionEvent };
