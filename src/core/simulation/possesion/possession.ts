/*
* Simulate a basketball possession
*/

import { Player, PlayerSkills } from '../../../data';
import { Lineup, averageStatRates, playerConstants, possessionConstants } from '../..';

type ShotTypeData = {
  [key: string]: {
    basePercentage: number;
    skillKey: keyof PlayerSkills;
    tendencyKey: keyof PlayerSkills;
    baseRate: number;
    points: number;
  };
};

export const shotTypeMapping: ShotTypeData = {
  'mid_range': {
    basePercentage: averageStatRates.twoPointShot.midRangePercentage,
    skillKey: 'mid_range',
    tendencyKey: 'tendency_mid_range',
    baseRate: averageStatRates.twoPointShot.midRangeRate,
    points: 2,
  },
  'corner_three': {
    basePercentage: averageStatRates.threePointShot.cornerThreePercentage,
    skillKey: 'three_point_corner',
    tendencyKey: 'tendency_corner_three',
    baseRate: averageStatRates.threePointShot.cornerThreeRate,
    points: 3,
  },
  'above_the_break_three': {
    basePercentage: averageStatRates.threePointShot.aboveTheBreakThreePercentage,
    skillKey: 'three_point_catch_and_shoot',
    tendencyKey: 'tendency_above_the_break_three',
    baseRate: averageStatRates.threePointShot.aboveTheBreakThreeRate,
    points: 3,
  },
  'drive_to_basket': {
    basePercentage: averageStatRates.twoPointShot.rimPercentage,
    skillKey: 'dunk',
    tendencyKey: 'tendency_drive_to_basket',
    baseRate: averageStatRates.twoPointShot.rimRate / 2, // hack because we don't have a separate rate for dribble-to-basket
    points: 2,
  },
  'rim': {
    basePercentage: averageStatRates.twoPointShot.rimPercentage,
    skillKey: 'dunk',
    tendencyKey: 'tendency_rim',
    baseRate: averageStatRates.twoPointShot.rimRate / 2, // hack like in drive_to_basket
    points: 2,
  },
  'paint': {
    basePercentage: averageStatRates.twoPointShot.paintPercentage,
    skillKey: 'post',
    tendencyKey: 'tendency_paint',
    baseRate: averageStatRates.twoPointShot.paintRate,
    points: 2,
  },

} as const;

export const shootingFoulMapping: ShotTypeData = {
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

  // counting stats
  oReb: number;
  dReb: number;
  assist: number;
  steal: number;
  block: number;
  turnover: number;
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
  turnover: 0,
  assist: 0,
  steal: 0,
  block: 0,
  foul: 0,
  ...stats
});

export type PossessionResult = {
  playerEvents: PlayerEvent[];
  possessionChange: boolean;
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
  qualifiers: number[],
  medianValue: number = playerConstants.leagueAverageSkill,
): T => {
  if (baseRates.length !== qualifiers.length) {
    throw new Error('baseRates and qualifiers must have the same length');
  }

  const normalizedRates = normalizeRates(baseRates, qualifiers, medianValue);
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

export const determineAssist = (players: Player[]): Player | null => {
  const numPlayers = players.length;
  const assistRate = averageStatRates.assistRatePerMadeFga;
  console.log('assistRate', assistRate, "should be like .50 or so");
  const leagueAverageSkill = playerConstants.leagueAverageSkill;

  const baseRates = [
    ...players.map(() => (assistRate / numPlayers)),
    (1 - assistRate)
  ];
  const qualifier = [
    ...players.map(player => player.skills.passing),
    leagueAverageSkill // this is a hack since the non-assist rate does not need to be qualified.
  ];

  const optionPicked = pickOptionWithBaseRates([...players, null], baseRates, qualifier);

  return optionPicked;
};

/**
 * TODO:
 * - need to add logic to determine how many FTs are made, if any are attempted.
 * - need to add logic to determine if there is a OReb/DReb.
 */

export const determineShot = (offensiveLineup: Lineup, defensiveLineup: Lineup, gameClock: number, shotClock: number): PossessionResult => {
  const shooter = pickOption(offensiveLineup.players, offensiveLineup.players.map(player => player.skills.tendency_score));
  const assister = determineAssist(offensiveLineup.players.filter(player => player !== shooter));

  // Use the mapping to get tendencies and base rates
  const shotTypeTendencies = Object.values(shotTypeMapping).map(
    mapping => shooter.skills[mapping.tendencyKey as keyof typeof shooter.skills]
  );
  const baseRates = Object.values(shotTypeMapping).map(mapping => mapping.baseRate);

  // Determine shot type using pickOptionWithBaseRates
  const shotType = pickOptionWithBaseRates(Object.keys(shotTypeMapping), baseRates, shotTypeTendencies);

  // Use the mapping to get the base percentage and skill quantifier
  const { basePercentage, skillKey } = shotTypeMapping[shotType];
  const skillQualifier = shooter.skills[skillKey as keyof typeof shooter.skills];

  console.log('shotType', shotType, basePercentage, skillQualifier, shotTypeMapping[shotType].points);
  const isMade = pickOptionWithBaseRates([true, false],
    [basePercentage, 1 - basePercentage],
    [skillQualifier, playerConstants.leagueAverageSkill],
  );

  let fta: 0 | 1 | 2 | 3 = 0;
  const points = shotTypeMapping[shotType].points;
  let reboundEvent: ReboundEvent | null = null;
  let possessionChange = true; // only an offensive rebound retains possession.

  if (isMade) {
    const andOneRate = averageStatRates.shootingFouls.andOneFoulRate;
    fta = pickOption([1, 0], [andOneRate, 1 - andOneRate]);
  } else if (!isMade) {
    if (points === 2) {
      const twoPointFoulRate = averageStatRates.shootingFouls.twoPointFoulRate;
      fta = pickOption([2, 0], [twoPointFoulRate, 1 - twoPointFoulRate]);
    } else if (points === 3) {
      const threePointFoulRate = averageStatRates.shootingFouls.threePointFoulRate;
      fta = pickOption([3, 0], [threePointFoulRate, 1 - threePointFoulRate]);
    }
  }

  const ftRes = determineFts(shooter, fta);
  const ftm = ftRes.filter(ft => ft === 1).length;

  // if there are no FTs or the last FT is missed, there should be a rebound
  if (fta === 0 || (ftRes.length > 0 && ftRes.at(-1) === 0)) {
    reboundEvent = determineRebound(offensiveLineup, defensiveLineup);
    possessionChange = reboundEvent.possessionChange;
  }

  const events = [createPlayerEvent(shooter.playerInfo.id, {
    twoFgm: points === 2 ? 1 : 0,
    twoFga: points === 2 ? 1 : 0,
    threeFgm: points === 3 ? 1 : 0,
    threeFga: points === 3 ? 1 : 0,
    ftm: ftm,
    fta: fta,
    points: shotTypeMapping[shotType].points,
  })];

  if (assister) {
    events.push(createPlayerEvent(assister.playerInfo.id, { assist: 1 }));
  }

  if (reboundEvent) {
    events.push(reboundEvent.playerEvent);
  }

  const possessionResult: PossessionResult = {
    playerEvents: events,
    timeLength: calculatePossessionLength(gameClock, shotClock),
    possessionChange: reboundEvent?.possessionChange ?? false,
  };

  return possessionResult;
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

export const simulatePossession = (
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
      return determineTurnover(offensiveTeam, defensiveTeam, gameClock, shotClock);

    case 'non_shooting_foul':
      const event = determineFoul(defensiveTeam);
      return {
        playerEvents: [event],
        timeLength: calculatePossessionLength(gameClock, shotClock),
        possessionChange: false,
      };

    case 'shot_attempt':
      return determineShot(offensiveTeam, defensiveTeam, gameClock, shotClock);

    default:
      throw new Error(`Invalid event index: ${eventIndex}`);
  }
};

export const determineFoul = (lineup: Lineup): PlayerEvent => {
  const offender = pickOption(lineup.players, lineup.players.map((p) => 1 - p.skills.defensive_iq));
  const event = createPlayerEvent(offender.playerInfo.id, { foul: 1 });

  return event;
};

/**
 * Cases for turnovers:
 * 1. turnover (off)
 * 2. turnover (off) + steal (def)
 * 3. turnover (off) + foul (off)
 */
export const determineTurnover = (
  offensiveTeam: Lineup,
  defensiveTeam: Lineup,
  gameClock: number,
  shotClock: number
): PossessionResult => {
  const outcomeOptions = ['steal', 'foul', 'plain_turnover'];
  const outcomeProbabilities = [
    averageStatRates.stealRatePerTurnover,
    averageStatRates.nonShootingFouls.offensiveFoulRate,
    1 - averageStatRates.stealRatePerTurnover - averageStatRates.nonShootingFouls.offensiveFoulRate,
  ];

  console.log('outcomeOptions', outcomeOptions);
  console.log('outcomeProbabilities', outcomeProbabilities);

  const outcome = pickOption(outcomeOptions, outcomeProbabilities);
  // we'll refine this later, for now just pick a random player.
  const ballHandler: Player = pickOption(offensiveTeam.players, offensiveTeam.players.map(() => 100));
  console.log(defensiveTeam.players.map(p => p.skills.defensive_iq));
  console.log(JSON.stringify(averageStatRates, null, 2));

  const turnoverEvent = createPlayerEvent(ballHandler.playerInfo.id, { turnover: 1 });
  const timeLength = calculatePossessionLength(gameClock, shotClock);

  switch (outcome) {
    case 'steal':
      const stolenBy: Player = pickOption(
        defensiveTeam.players,
        defensiveTeam.players.map((p) => p.skills.defensive_iq)
      );
      const stealEvent = createPlayerEvent(stolenBy.playerInfo.id, { steal: 1 });
      return {
        playerEvents: [turnoverEvent, stealEvent],
        timeLength,
        possessionChange: true,
      };

    case 'foul':
      const foulEvent = determineFoul(offensiveTeam);
      return {
        playerEvents: [turnoverEvent, foulEvent],
        timeLength,
        possessionChange: true,
      };

    case 'plain_turnover':
      return {
        playerEvents: [turnoverEvent],
        timeLength,
        possessionChange: true,
      };

    default:
      throw new Error(`Invalid outcome: ${outcome}`);
  }
};

// Kinda janky piecewise function but works well
// returns an array of makes/misses, since missing the last FT can lead to a rebound.
const determineFts = (player: Player, fta: number): (0 | 1)[] => {
  if (fta === 0) return [];

  const ftSkill = player.skills.free_throw;
  let ftPercentage = 30;

  // Define breakpoints and corresponding probabilities
  const breakpoints = [0, 25, 40, 50, 60, 70, 80, 90, 100];
  const probabilities = [30, 45, 64, 72, 78, 85, 90, 93, 95];

  for (let i = 0; i < breakpoints.length - 1; i++) {
    if (ftSkill <= breakpoints[i + 1]) {
      // Linear interpolation between breakpoints
      const range = breakpoints[i + 1] - breakpoints[i];
      const proportion = (ftSkill - breakpoints[i]) / range;
      ftPercentage = probabilities[i] + proportion * (probabilities[i + 1] - probabilities[i]);
      break;
    }
  }

  ftPercentage = Math.max(30, Math.min(95, ftPercentage));

  let ftRes: (0 | 1)[] = [];
  for (let i = 0; i < fta; i++) {
    if (Math.random() < ftPercentage) {
      ftRes.push(1);
    } else {
      ftRes.push(0);
    }
  }

  return ftRes;
};

type ReboundEvent = {
  playerEvent: PlayerEvent,
  rebound: 'oReb' | 'dReb',
  possessionChange: boolean;
};

// determine the team and player that wins the rebound.
const determineRebound = (offensiveLineup: Lineup, defensiveLineup: Lineup): ReboundEvent => {
  const lineups = {
    dReb: defensiveLineup.players,
    oReb: offensiveLineup.players,
  };
  const skillKeys = {
    dReb: 'defensive_rebounding',
    oReb: 'offensive_rebounding'
  } as const;

  const reboundRates = [
    averageStatRates.defensiveReboundRatePerMissedFga,
    averageStatRates.offensiveReboundRatePerMissedFga
  ];

  const lineupRebStrengths = [
    defensiveLineup.players.reduce((sum, p) => sum + p.skills.defensive_rebounding, 0),
    offensiveLineup.players.reduce((sum, p) => sum + p.skills.offensive_rebounding, 0)
  ];

  const wonReb: 'oReb' | 'dReb' = pickOptionWithBaseRates(['oReb', 'dReb'], reboundRates, lineupRebStrengths);
  console.log("reboundRates:", reboundRates, "lineupRebStrengths:", lineupRebStrengths, "wonRebound:", wonReb);

  const teamRebounding = lineups[wonReb];
  const rebRates = teamRebounding.map(p => p.skills[skillKeys[wonReb]]);
  const playerRebounding = pickOption(teamRebounding, rebRates);

  const playerEvent = createPlayerEvent(playerRebounding.playerInfo.id, {
    [wonReb]: 1
  });

  return {
    playerEvent,
    rebound: wonReb,
    possessionChange: wonReb === 'oReb',
  };
};

const generateNormalDistribution = (mean: number, standardDeviation: number): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.round(z * standardDeviation + mean);
};

const calculatePossessionLength = (gameClock: number, shotClock: number): number => {
  const mean = 16;
  const standardDeviation = 4;
  let possessionLength = generateNormalDistribution(mean, standardDeviation);

  // Ensure the possession length is between 1 and 24 seconds
  possessionLength = Math.max(1, Math.min(Math.min(shotClock, gameClock), possessionLength));

  return possessionLength;
};
