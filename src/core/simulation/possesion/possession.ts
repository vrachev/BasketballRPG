/*
* Simulate a basketball possession
*/

import { Player } from '../../../data';
import { Lineup, averageStatRates, playerConstants, possessionConstants } from '../..';

export const shotTypeMapping = {
  'mid_range': {
    basePercentage: averageStatRates.twoPointShot.midRangePercentage,
    skillKey: 'mid_range',
    tendencyKey: 'tendency_mid_range',
    baseRate: averageStatRates.twoPointShot.midRangeRate,
    points: 2,
    shotType: 'two_point_shot_attempt',
  },
  'corner_three': {
    basePercentage: averageStatRates.threePointShot.cornerThreePercentage,
    skillKey: 'three_point_corner',
    tendencyKey: 'tendency_corner_three',
    baseRate: averageStatRates.threePointShot.cornerThreeRate,
    points: 3,
    shotType: 'three_point_shot_attempt',
  },
  'above_the_break_three': {
    basePercentage: averageStatRates.threePointShot.aboveTheBreakThreePercentage,
    skillKey: 'three_point_catch_and_shoot',
    tendencyKey: 'tendency_above_the_break_three',
    baseRate: averageStatRates.threePointShot.aboveTheBreakThreeRate,
    points: 3,
    shotType: 'three_point_shot_attempt',
  },
  'drive_to_basket': {
    basePercentage: averageStatRates.twoPointShot.rimPercentage,
    skillKey: 'dunk',
    tendencyKey: 'tendency_drive_to_basket',
    baseRate: averageStatRates.twoPointShot.rimRate / 2,
    points: 2,
    shotType: 'two_point_shot_attempt',
  },
  'rim': {
    basePercentage: averageStatRates.twoPointShot.rimPercentage,
    skillKey: 'dunk',
    tendencyKey: 'tendency_rim',
    baseRate: averageStatRates.twoPointShot.rimRate / 2,
    points: 2,
    shotType: 'two_point_shot_attempt',
  },
  'paint': {
    basePercentage: averageStatRates.twoPointShot.paintPercentage,
    skillKey: 'post',
    tendencyKey: 'tendency_paint',
    baseRate: averageStatRates.twoPointShot.paintRate,
    points: 2,
    shotType: 'two_point_shot_attempt',
  },

} as const;

export const shootingFoulMapping = {
  'free_throw': {
    basePercentage: averageStatRates.freeThrowPercentage,
    skillKey: 'free_throw',
    tendencyKey: 'tendency_free_throw_drawing',
    baseRate: averageStatRates.shootingFouls.foulsPerFga,
    points: 1,
  },
} as const;

export type PlayerEvent = {
  pid: number;

  // scoring
  twoFgm: number;
  twoFga: number;
  threeFgm: number;
  threeFga: number;
  ftm: number;
  fta: number;
  points: number;

  oReb: number;
  dReb: number;
  assist: number;
  steal: number;
  block: number;
  foul: number;
};

export const createPlayerEvent = (pid: number, stats?: Partial<Omit<PlayerEvent, 'pid'>>): PlayerEvent => ({
  pid,
  twoFgm: 0,
  twoFga: 0,
  threeFgm: 0,
  threeFga: 0,
  ftm: 0,
  fta: 0,
  points: 0,
  oReb: 0,
  dReb: 0,
  assist: 0,
  steal: 0,
  block: 0,
  foul: 0,
  ...stats
});

export type PossessionResult = {
  playerEvents: PlayerEvent[];
  timeLength: number;
};

export type PossessionInput = {
  offensiveTeam: Lineup;
  defensiveTeam: Lineup;
  gameClock: number;
  shotClock: number;
  period: number;
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

export const pickOptionWithBaseRates = <T>(
  options: T[],
  baseRates: number[],
  quantifiers: number[],
  medianValue: number = playerConstants.leagueAverageSkill,
): T => {
  if (baseRates.length !== quantifiers.length) {
    throw new Error('baseRates and quantifiers must have the same length');
  }

  const normalizedRates = normalizeRates(baseRates, quantifiers, medianValue);
  return pickOption(options, normalizedRates);
};

export const pickOption = <T>(options: T[], weights: number[]): T => {
  const totalOdds = weights.reduce((sum, tendency) => sum + tendency, 0);
  const randomValue = Math.random() * totalOdds;
  let cumulativeOdds = 0;

  if (totalOdds === 0) {
    return options[Math.floor(Math.random() * weights.length)];
  }

  for (let i = 0; i < weights.length; i++) {
    cumulativeOdds += weights[i];
    if (randomValue <= cumulativeOdds) {
      return options[i];
    }
  }

  throw new Error(`randomValue is out of bounds: ${randomValue}, totalOdds: ${totalOdds}`);
};

export const determineAssist = (players: Player[]) => {
  const numPlayers = players.length;
  const assistPercentage = averageStatRates.assistRatePerMadeFga;
  console.log('assistPercentage', assistPercentage, "should be like .50 or so");
  const leagueAverageSkill = playerConstants.leagueAverageSkill;

  const baseRates = [
    ...players.map(() => (assistPercentage / numPlayers)),
    (1 - assistPercentage)
  ];
  const quantifiers = [
    ...players.map(player => player.skills.passing),
    leagueAverageSkill
  ];

  const optionPicked = pickOptionWithBaseRates(baseRates, quantifiers);

  const passer = optionPicked < numPlayers ? players[optionPicked] : null;
  return passer;
};

export const determineShot = (players: Player[]): PossessionResult => {
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
    const andOneRate = averageStatRates.shootingFouls.andOneFoulRate;
    if (pickOption([andOneRate, 1 - andOneRate]) === 0) fts = 1;
  }

  if (!isMade) {
    const points = shotTypeMapping[shotType].points;
    if (points === 2) {
      const twoPointFoulRate = averageStatRates.shootingFouls.twoPointFoulRate;
      if (pickOption([twoPointFoulRate, 1 - twoPointFoulRate]) === 0) {
        fts = 2;
      }
    } else if (points === 3) {
      const threePointFoulRate = averageStatRates.shootingFouls.threePointFoulRate;
      console.log('threePointFoulRate', threePointFoulRate);
      console.log(JSON.stringify(averageStatRates, null, 2));
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
 * 1. Turnover (off) + (?steal (def) | ?foul (off))
 * 2. No shot foul (def) + ?FTs-from-penalty (off)
 * 3. Shot Attempt + (make + ?assist + ?and1FT) | (miss + ((?block | ?Oreb | ? Dreb) | ?(foul + FTs)))
 *    if last FT is missed, there will be a rebound.
 * 4. End of period
 * 5. End of game
 */

const simulatePossession = (
  { offensiveTeam, defensiveTeam, gameClock, period, shotClock = possessionConstants.shotClock }: PossessionInput
): PossessionResult => {

  const options = [
    'turnover',
    'non_shooting_foul',
    'shot_attempt',
  ];

  const eventProbabilities = [
    averageStatRates.possessionEndEvents.turnoverRate,
    averageStatRates.possessionEndEvents.nonShootingFoulDefensiveRate,
    averageStatRates.possessionEndEvents.shotOrShootingFoulRate,
  ];

  const eventIndex = pickOption(options, eventProbabilities);

  switch (eventIndex) {
    case 'turnover':
      return determineTurnover(offensiveTeam, defensiveTeam);
    case 'non_shooting_foul':
      return determineFoul(defensiveTeam, gameClock, shotClock);
    case 'shot_attempt':
      return determineShot(offensiveTeam.players);
    default:
      throw new Error(`Invalid event index: ${eventIndex}`);
  }
};

export const determineFoul = (lineup: Lineup, gameClock: number, shotClock: number): PossessionResult => {
  const offender = pickOption(lineup.players, lineup.players.map((p) => 1 - p.skills.defensive_iq));
  const event = createPlayerEvent(offender.playerInfo.id, { foul: 1 });
  const possessionResult: PossessionResult = {
    playerEvents: [event],
    timeLength: calculatePossessionLength(gameClock, shotClock),
  };

  return possessionResult;
};

export const determineTurnover = (offensiveTeam: Lineup, defensiveTeam: Lineup): PossessionResult => {
  const stealRateForTurnovers = averageStatRates.stealRatePerTurnover;
  console.log('stealRateForTurnovers', stealRateForTurnovers);
  const wasStolen: boolean = pickOption([stealRateForTurnovers, 1 - stealRateForTurnovers]) === 0;

  // we'll refine this later, for now just pick a random player.
  const ballHandler: Player = offensiveTeam.players[pickOption([100, 100, 100, 100, 100])];
  console.log(defensiveTeam.players.map(p => p.skills.defensive_iq));
  console.log(JSON.stringify(averageStatRates, null, 2));

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

const calculatePossessionLength = (gameClock: number, shotClock: number): number => {
  const mean = 16;
  const standardDeviation = 4;
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  let possessionLength = Math.round(z * standardDeviation + mean);

  // Ensure the possession length is between 1 and 24 seconds
  possessionLength = Math.max(1, Math.min(Math.min(shotClock, gameClock), possessionLength));

  return possessionLength;
};
