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

export const normalizeRates = (baseRates: number[], quantifiers: number[], medianValue: number): number[] => {
  const adjustedRates = baseRates.map((rate, index) => {
    const quantifier = quantifiers[index];
    const adjustment = (quantifier / medianValue);
    return Math.max(0, Math.min(1, rate * adjustment));
  });

  const totalAdjustedRate = adjustedRates.reduce((sum, rate) => sum + rate, 0);
  return adjustedRates.map(rate => Number((rate / totalAdjustedRate).toFixed(4)));
};

export const pickOptionWithBaseRates = (
  baseRates: number[],
  quantifiers: number[],
  medianValue: number = playerConstants.leagueAverageSkill,
): number => {
  if (baseRates.length !== quantifiers.length) {
    throw new Error('baseRates and quantifiers must have the same length');
  }

  const normalizedRates = normalizeRates(baseRates, quantifiers, medianValue);
  return pickOption(normalizedRates);
};

export const pickOption = (weights: number[]) => {
  const totalOdds = weights.reduce((sum, tendency) => sum + tendency, 0);
  const randomValue = Math.random() * totalOdds;
  let cumulativeOdds = 0;

  if (totalOdds === 0) {
    return Math.floor(Math.random() * weights.length);
  }

  if (randomValue >= totalOdds) {
    return weights.length - 1;
  }

  for (let i = 0; i < weights.length; i++) {
    cumulativeOdds += weights[i];
    if (randomValue <= cumulativeOdds) {
      return i;
    }
  }

  throw new Error(`randomValue is out of bounds: ${randomValue}, totalOdds: ${totalOdds}`);
};

export const determineAssist = (players: Player[]) => {
  const numPlayers = players.length;
  const assistPercentage = averageGameStatsPerTeam.assistPercentage;
  const leagueAverageSkill = playerConstants.leagueAverageSkill;

  const baseRates = [
    ...players.map(() => (1 - assistPercentage) / numPlayers),
    assistPercentage
  ];
  const quantifiers = [
    ...players.map(player => player.skills.passing),
    leagueAverageSkill
  ];

  const optionPicked = pickOptionWithBaseRates(baseRates, quantifiers);

  const passer = optionPicked < numPlayers ? players[optionPicked] : null;
  return passer;
};

export const determineShot = (players: Player[]) => {
  const shooter = players[pickOption(players.map(player => player.skills.tendency_score))];
  const assister = determineAssist(players.filter(player => player !== shooter));

  // Determine shot type based on shooting tendencies
  const shotTypeTendencies = [
    shooter.skills.tendency_mid_range,
    shooter.skills.tendency_corner_three,
    shooter.skills.tendency_above_the_break_three,
    shooter.skills.tendency_drive_to_basket,
    shooter.skills.tendency_rim,
    shooter.skills.tendency_paint
  ];

  // Define base rates from constants
  const baseRates = [
    averageGameStatsPerTeam.twoPointShot.midRangeRate,
    averageGameStatsPerTeam.threePointShot.cornerThreeRate,
    averageGameStatsPerTeam.threePointShot.aboveTheBreakThreeRate,
    averageGameStatsPerTeam.twoPointShot.rimRate / 2, // Assuming drive_to_basket is half of rim shots
    averageGameStatsPerTeam.twoPointShot.rimRate / 2, // The other half of rim shots
    averageGameStatsPerTeam.twoPointShot.paintRate
  ];

  // Determine shot type using pickOptionWithBaseRates
  const shotTypeIndex = pickOptionWithBaseRates(baseRates, shotTypeTendencies);

  // Map shot type index to shot type
  const shotTypes = ['mid_range', 'corner_three', 'above_the_break_three', 'drive_to_basket', 'rim', 'paint'];
  const shotType = shotTypes[shotTypeIndex];

  // Determine if the shot is made
  let basePercentage: number;
  let skillQuantifier: number;

  switch (shotType) {
    case 'mid_range':
      basePercentage = averageGameStatsPerTeam.twoPointShot.midRangePercentage;
      skillQuantifier = shooter.skills.mid_range;
      break;
    case 'corner_three':
      basePercentage = averageGameStatsPerTeam.threePointShot.cornerThreePercentage;
      skillQuantifier = shooter.skills.three_point_catch_and_shoot;
      break;
    case 'above_the_break_three':
      basePercentage = averageGameStatsPerTeam.threePointShot.aboveTheBreakThreePercentage;
      skillQuantifier = shooter.skills.three_point_catch_and_shoot;
      break;
    case 'drive_to_basket':
    case 'rim':
      basePercentage = averageGameStatsPerTeam.twoPointShot.rimPercentage;
      skillQuantifier = shooter.skills.dunk;
      break;
    case 'paint':
      basePercentage = averageGameStatsPerTeam.twoPointShot.paintPercentage;
      skillQuantifier = shooter.skills.post;
      break;
    default:
      throw new Error(`Invalid shot type: ${shotType}`);
  }

  const isMade = pickOptionWithBaseRates(
    [basePercentage, 1 - basePercentage],
    [skillQuantifier, playerConstants.leagueAverageSkill],
    playerConstants.leagueAverageSkill
  ) === 0;

  return {
    isMade,
    shooter,
    assister,
    shotType,
  };
};


// Also export the types if they're not already exported
export type { PossessionInput, PossessionResult, PossessionEvent };
