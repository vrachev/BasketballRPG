/*
* Simulate a basketball possession
*/

import { Player, Team } from '../../../data';
import { Lineup } from '../..';
import { possessionConstants, averageGameStatsPerTeam, playerConstants } from '../..';

const shotTypeMapping = {
  'mid_range': {
    basePercentage: averageGameStatsPerTeam.twoPointShot.midRangePercentage,
    skillKey: 'mid_range',
    tendencyKey: 'tendency_mid_range',
    baseRate: averageGameStatsPerTeam.twoPointShot.midRangeRate,
    points: 2,
  },
  'corner_three': {
    basePercentage: averageGameStatsPerTeam.threePointShot.cornerThreePercentage,
    skillKey: 'three_point_corner',
    tendencyKey: 'tendency_corner_three',
    baseRate: averageGameStatsPerTeam.threePointShot.cornerThreeRate,
    points: 3,
  },
  'above_the_break_three': {
    basePercentage: averageGameStatsPerTeam.threePointShot.aboveTheBreakThreePercentage,
    skillKey: 'three_point_catch_and_shoot',
    tendencyKey: 'tendency_above_the_break_three',
    baseRate: averageGameStatsPerTeam.threePointShot.aboveTheBreakThreeRate,
    points: 3,
  },
  'drive_to_basket': {
    basePercentage: averageGameStatsPerTeam.twoPointShot.rimPercentage,
    skillKey: 'dunk',
    tendencyKey: 'tendency_drive_to_basket',
    baseRate: averageGameStatsPerTeam.twoPointShot.rimRate / 2,
    points: 2,
  },
  'rim': {
    basePercentage: averageGameStatsPerTeam.twoPointShot.rimPercentage,
    skillKey: 'dunk',
    tendencyKey: 'tendency_rim',
    baseRate: averageGameStatsPerTeam.twoPointShot.rimRate / 2,
    points: 2,
  },
  'paint': {
    basePercentage: averageGameStatsPerTeam.twoPointShot.paintPercentage,
    skillKey: 'post',
    tendencyKey: 'tendency_paint',
    baseRate: averageGameStatsPerTeam.twoPointShot.paintRate,
    points: 2,
  },

} as const;

const freeThrowMapping = {
  'free_throw': {
    basePercentage: averageGameStatsPerTeam.FreeThrowPercentage,
    skillKey: 'free_throw',
    tendencyKey: 'tendency_free_throw_drawing',
    baseRate: averageGameStatsPerTeam.FreeThrowAttempts / averageGameStatsPerTeam.possessions,
    points: 1,
  },
} as const;

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

type BaseShotAttempt = {
  shooter: Player;
  points: number;
  assist?: Assist;
  distance?: number;
  defender?: Player;
  contested?: boolean;
  shotQualifier?: ('step_back' | 'catch_and_shoot' | 'pull_up' | 'fadeaway' | 'heave' | 'deep')[];
  made: boolean;
};

type TwoPointShotAttempt = BaseShotAttempt & {
  shotType: keyof Pick<typeof shotTypeMapping, {
    [K in keyof typeof shotTypeMapping]: typeof shotTypeMapping[K]['points'] extends 2 ? K : never
  }[keyof typeof shotTypeMapping]>;
};

type ThreePointShotAttempt = BaseShotAttempt & {
  shotType: keyof Pick<typeof shotTypeMapping, {
    [K in keyof typeof shotTypeMapping]: typeof shotTypeMapping[K]['points'] extends 3 ? K : never
  }[keyof typeof shotTypeMapping]>;
};

type ShotAttempt = TwoPointShotAttempt | ThreePointShotAttempt;

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
  const normalizedRates = adjustedRates.map(rate => Number((rate / totalAdjustedRate).toFixed(4)));

  return normalizedRates;
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

export const determineShot = (players: Player[]): ShotAttempt => {
  const shooter = players[pickOption(players.map(player => player.skills.tendency_score))];
  const assister = determineAssist(players.filter(player => player !== shooter));

  // Use the mapping to get tendencies and base rates
  const shotTypeTendencies = Object.values(shotTypeMapping).map(
    mapping => shooter.skills[mapping.tendencyKey as keyof typeof shooter.skills]
  );
  const baseRates = Object.values(shotTypeMapping).map(mapping => mapping.baseRate);

  // Determine shot type using pickOptionWithBaseRates
  const shotTypeIndex = pickOptionWithBaseRates(baseRates, shotTypeTendencies);

  // Get the shot type using the index
  const shotType = Object.keys(shotTypeMapping)[shotTypeIndex] as keyof typeof shotTypeMapping;

  // Use the mapping to get the base percentage and skill quantifier
  const { basePercentage, skillKey } = shotTypeMapping[shotType];
  const skillQuantifier = shooter.skills[skillKey as keyof typeof shooter.skills];

  const isMade = pickOptionWithBaseRates(
    [basePercentage, 1 - basePercentage],
    [skillQuantifier, playerConstants.leagueAverageSkill],
    playerConstants.leagueAverageSkill
  ) === 0;

  const assist: Assist | undefined = assister ? {
    type: 'assist',
    assister,
    scorer: shooter,
  } : undefined;

  const shotAttempt: ShotAttempt = {
    made: isMade,
    shooter: shooter,
    assist: assist,
    shotType: shotType,
    points: shotTypeMapping[shotType].points
  };

  return shotAttempt;
};


// Also export the types if they're not already exported
export type { PossessionInput, PossessionResult, PossessionEvent };
