/*
* Simulate a basketball possession
*/

import { Player, Team } from '../../../data';
import { Lineup } from '../..';
import { possessionConstants, averageGameStatsPerTeam, playerConstants } from '../..';

export const shotTypeMapping = {
  'mid_range': {
    basePercentage: averageGameStatsPerTeam.twoPointShot.midRangePercentage,
    skillKey: 'mid_range',
    tendencyKey: 'tendency_mid_range',
    baseRate: averageGameStatsPerTeam.twoPointShot.midRangeRate,
    points: 2,
    shotType: 'two_point_shot_attempt',
  },
  'corner_three': {
    basePercentage: averageGameStatsPerTeam.threePointShot.cornerThreePercentage,
    skillKey: 'three_point_corner',
    tendencyKey: 'tendency_corner_three',
    baseRate: averageGameStatsPerTeam.threePointShot.cornerThreeRate,
    points: 3,
    shotType: 'three_point_shot_attempt',
  },
  'above_the_break_three': {
    basePercentage: averageGameStatsPerTeam.threePointShot.aboveTheBreakThreePercentage,
    skillKey: 'three_point_catch_and_shoot',
    tendencyKey: 'tendency_above_the_break_three',
    baseRate: averageGameStatsPerTeam.threePointShot.aboveTheBreakThreeRate,
    points: 3,
    shotType: 'three_point_shot_attempt',
  },
  'drive_to_basket': {
    basePercentage: averageGameStatsPerTeam.twoPointShot.rimPercentage,
    skillKey: 'dunk',
    tendencyKey: 'tendency_drive_to_basket',
    baseRate: averageGameStatsPerTeam.twoPointShot.rimRate / 2,
    points: 2,
    shotType: 'two_point_shot_attempt',
  },
  'rim': {
    basePercentage: averageGameStatsPerTeam.twoPointShot.rimPercentage,
    skillKey: 'dunk',
    tendencyKey: 'tendency_rim',
    baseRate: averageGameStatsPerTeam.twoPointShot.rimRate / 2,
    points: 2,
    shotType: 'two_point_shot_attempt',
  },
  'paint': {
    basePercentage: averageGameStatsPerTeam.twoPointShot.paintPercentage,
    skillKey: 'post',
    tendencyKey: 'tendency_paint',
    baseRate: averageGameStatsPerTeam.twoPointShot.paintRate,
    points: 2,
    shotType: 'two_point_shot_attempt',
  },

} as const;

export const freeThrowMapping = {
  'free_throw': {
    basePercentage: averageGameStatsPerTeam.FreeThrowPercentage,
    skillKey: 'free_throw',
    tendencyKey: 'tendency_free_throw_drawing',
    baseRate: averageGameStatsPerTeam.FreeThrowAttempts / averageGameStatsPerTeam.possessions,
    points: 1,
  },
} as const;

// Possession Event Types

type PossessionEventType =
  | 'assist'
  | 'turnover'
  | 'foul'
  | 'two_point_shot_attempt'
  | 'three_point_shot_attempt'
  | 'free_throw_shot_attempt'
  | 'steal'
  | 'block'
  | 'offensive_rebound'
  | 'defensive_rebound'
  | 'end_of_period'
  | 'end_of_game';

export type BasePossessionEvent = {
  t: PossessionEventType;
};

export type Assist = BasePossessionEvent & {
  t: 'assist';
  assister: Player;
  scorer: Player;
};

export type Turnover = BasePossessionEvent & {
  t: 'turnover';
  player: Player;
  cause: 'bad pass' | 'steal' | 'offensive foul' | 'shot clock violation' | 'other';
};

export type Foul = BasePossessionEvent & {
  t: 'foul';
  offender: Player;
  fouled: Player;
  foulType: 'personal' | 'technical' | 'flagrant';
};

export type BaseShotAttempt = {
  shooter: Player;
  points: number;
  assist?: Assist;
  distance?: number;
  defender?: Player;
  contested?: boolean;
  shotQualifier?: ('step_back' | 'catch_and_shoot' | 'pull_up' | 'fadeaway' | 'heave' | 'deep')[];
  result: 'made' | 'missed';
  fts: 0 | 1 | 2 | 3;
};

export type TwoPointShotAttempt = BasePossessionEvent & BaseShotAttempt & {
  t: 'two_point_shot_attempt';
  shotType: keyof Pick<typeof shotTypeMapping, {
    [K in keyof typeof shotTypeMapping]: typeof shotTypeMapping[K]['points'] extends 2 ? K : never
  }[keyof typeof shotTypeMapping]>;
};

export type ThreePointShotAttempt = BasePossessionEvent & BaseShotAttempt & {
  t: 'three_point_shot_attempt';
  shotType: keyof Pick<typeof shotTypeMapping, {
    [K in keyof typeof shotTypeMapping]: typeof shotTypeMapping[K]['points'] extends 3 ? K : never
  }[keyof typeof shotTypeMapping]>;
};

export type ShotAttempt = TwoPointShotAttempt | ThreePointShotAttempt;

export type FreeThrowShotAttempt = BasePossessionEvent & {
  t: 'free_throw_shot_attempt';
  shooter: Player;
  made: boolean;
};

export type Steal = BasePossessionEvent & {
  t: 'steal';
  ballHandler: Player;
  stolenBy: Player;
};

export type Block = BasePossessionEvent & {
  t: 'block';
  blocker: Player;
  shotAttempt: TwoPointShotAttempt | ThreePointShotAttempt;
};

export type OffensiveRebound = BasePossessionEvent & {
  t: 'offensive_rebound';
  rebounder: Player;
};

export type DefensiveRebound = BasePossessionEvent & {
  t: 'defensive_rebound';
  rebounder: Player;
};

export type EndOfPeriod = BasePossessionEvent & {
  type: 'end_of_period';
  period: number;
};

export type EndOfGame = BasePossessionEvent & {
  t: 'end_of_game';
};

export type PossessionEvent =
  | Assist
  | Turnover
  | Foul
  | TwoPointShotAttempt
  | ThreePointShotAttempt
  | FreeThrowShotAttempt
  | OffensiveRebound
  | DefensiveRebound
  | EndOfPeriod
  | EndOfGame
  | Steal
  | Block;


export type PossessionResult = {
  events: PossessionEvent[];
  offensiveTeam: Lineup;
  defensiveTeam: Lineup;
  timeLength: number;
};

export type PossessionInput = {
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
  console.log('normalizedRates', normalizedRates);
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

  console.log('shotType', shotType, basePercentage, skillQuantifier, shotTypeMapping[shotType].points);
  const isMade = pickOptionWithBaseRates(
    [basePercentage, 1 - basePercentage],
    [skillQuantifier, playerConstants.leagueAverageSkill],
    playerConstants.leagueAverageSkill
  ) === 0;

  let fts: 0 | 1 | 2 | 3 = 0;
  if (isMade) {
    const andOneRate = averageGameStatsPerTeam.andOneFoulRate;
    if (pickOption([andOneRate, 1 - andOneRate]) === 0) fts = 1;
  }

  if (!isMade) {
    const points = shotTypeMapping[shotType].points;
    if (points === 2) {
      const twoPointFoulRate = averageGameStatsPerTeam.twoPointFoulRate;
      if (pickOption([twoPointFoulRate, 1 - twoPointFoulRate]) === 0) {
        fts = 2;
      }
    } else if (points === 3) {
      const threePointFoulRate = averageGameStatsPerTeam.threePointFoulRate;
      console.log('threePointFoulRate', threePointFoulRate);
      console.log(JSON.stringify(averageGameStatsPerTeam, null, 2));
      if (pickOption([threePointFoulRate, 1 - threePointFoulRate]) === 0) {
        fts = 3;
      }
    }
  }

  const assist: Assist | undefined = assister ? {
    t: 'assist',
    assister,
    scorer: shooter,
  } : undefined;

  const shotAttemptBase: BaseShotAttempt = {
    shooter,
    assist,
    points: shotTypeMapping[shotType].points,
    result: isMade ? 'made' : 'missed',
    fts,
  };

  // something is very off with how we construct this type
  // and how we've created the shotTypeMapping object.
  // For now we'll just cast it to the correct type since we know it's correct,
  // but I am not happy.
  const shotAttempt: ShotAttempt = {
    ...shotAttemptBase,
    t: shotTypeMapping[shotType].shotType,
    shotType,
  } as ShotAttempt;

  return shotAttempt;
};

/**
 * Here are the cases:
 * 1. Turnover (off) + ?steal (def)
 * 2. Foul (def | off) + ?FTs-from-penalty (off)
 * 3. ✅ Shot Attempt + (make + ?assist + ?and1FT) | (miss + (?block | ?Oreb | ? Dreb) | ?(foul + FTs))
 * 4. End of period
 * 5. End of game
 */

const determinePossessionResult = (
  offensiveTeam: Lineup,
  defensiveTeam: Lineup
): PossessionResult => {
  const eventProbabilities = [
    averageGameStatsPerTeam.steals / averageGameStatsPerTeam.possessions,
    averageGameStatsPerTeam.turnovers / averageGameStatsPerTeam.possessions,
    averageGameStatsPerTeam.personalFouls / averageGameStatsPerTeam.possessions,
    1 - (
      averageGameStatsPerTeam.steals / averageGameStatsPerTeam.possessions +
      averageGameStatsPerTeam.turnovers / averageGameStatsPerTeam.possessions +
      averageGameStatsPerTeam.personalFouls / averageGameStatsPerTeam.possessions
    )
  ];

  return {
    events: [],
    offensiveTeam,
    defensiveTeam,
    timeLength: 0,
  };

  // const eventIndex = pickOption(eventProbabilities);

  // switch (eventIndex) {
  //   case 0: // turnover
  //     return determineTurnover(offensiveTeam, defensiveTeam);

  // }

  // switch (eventIndex) {
  //   case 0: // Steal
  //     return {
  //       type: 'turnover',
  //       player: shotAttempt.shooter,
  //       cause: 'steal',
  //     };
  //   case 2: // Turnover
  //     return {
  //       type: 'turnover',
  //       player: players[pickOption(players.map(player => player.skills.tendency_score))],
  //       cause: 'bad pass',
  //     };
  //   case 3: // Foul
  //     return {
  //       type: 'foul',
  //       offender: players[pickOption(players.map(player => player.skills.tendency_score))],
  //       fouled: shotAttempt.shooter,
  //       foulType: 'personal',
  //     };
  //   default: // Shot Attempt
  //     return shotAttempt;
  // }

};

export const determineTurnover = (offensiveTeam: Lineup, defensiveTeam: Lineup): PossessionResult => {
  const stealRateForTurnovers = averageGameStatsPerTeam.steals / averageGameStatsPerTeam.turnovers;
  console.log('stealRateForTurnovers', stealRateForTurnovers);
  const wasStolen: boolean = pickOption([stealRateForTurnovers, 1 - stealRateForTurnovers]) === 0;

  // we'll refine this later, for now just pick a random player.
  const ballHandler: Player = offensiveTeam.players[pickOption([100, 100, 100, 100, 100])];
  console.log(defensiveTeam.players.map(p => p.skills.defensive_iq));

  const turnover: Turnover = {
    t: 'turnover',
    player: ballHandler,
    cause: wasStolen ? 'steal' : 'bad pass',
  };

  const events: PossessionEvent[] = [turnover];
  let steal: Steal | undefined;
  if (wasStolen) {
    const stolenBy: Player = defensiveTeam.players[pickOption(defensiveTeam.players.map(p => p.skills.defensive_iq))];
    steal = {
      t: 'steal',
      ballHandler,
      stolenBy,
    };
    events.push(steal);
  }

  return {
    events,
    offensiveTeam,
    defensiveTeam,
    timeLength: 0,
  };
};
