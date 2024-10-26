/**
 *  Stats from:
 *  https://shottracker.com/articles/the-3-point-revolution#:~:text=Five%20years%20after%20its%20inception,the%20trend%20is%20leveling%20off.
 * 
 * https://www.basketball-reference.com/leagues/NBA_stats_per_game.html
 * */

export const possessionConstants = {
  shotClock: 24,
  periodLength: 12 * 60,
  overtimePeriodLength: 5 * 60,
} as const;


export const playerConstants = {
  leagueAverageSkill: 50,
} as const;


export const averageGameStatsPerTeam = {
  // In real life offensive rebounds do not mark a new possession,
  // but because we standardize rates around possession, we add ORebs
  // to our denominator.
  get possessions() {
    return 98.5 + this.offensiveRebounds;
  },
  fga: 88.9,
  fgm: 42.2,
  get missedFg() {
    return this.fga - this.fgm;
  },
  fta: 21.7,
  ftm: 17.0,
  twoFga: 53.8,
  twoFgm: 29.4,
  threeFga: 35.1,
  threeFgm: 12.8,
  assists: 26.7,
  steals: 7.5,
  blocks: 5.1,
  turnovers: 13.6,
  FreeThrowAttempts: 27.3,
  personalFouls: 18.7,
  offensiveRebounds: 10.6,
  defensiveRebounds: 33.0,
  get rebounds() {
    return this.offensiveRebounds + this.defensiveRebounds;
  },
} as const;

export const averageStatRates = {
  twoPointShot: {
    rimRate: 0.305,
    rimPercentage: 0.66,
    paintRate: 0.135,
    paintPercentage: 0.435,
    midRangeRate: 0.16,
    midRangePercentage: 0.435,
    get twoPointShotRate() {
      return this.rimRate + this.paintRate + this.midRangeRate;
    },
    get cumulativeTwoPointPercentage() {
      return (this.rimPercentage * this.rimRate +
        this.paintPercentage * this.paintRate +
        this.midRangePercentage * this.midRangeRate) /
        this.twoPointShotRate;
    },
  },
  threePointShot: {
    cornerThreeRate: 0.09,
    cornerThreePercentage: 0.4,
    aboveTheBreakThreeRate: 0.31,
    aboveTheBreakThreePercentage: 0.37,
    get threePointShotRate() {
      return this.cornerThreeRate + this.aboveTheBreakThreeRate;
    },
    get cumulativeThreePointPercentage() {
      return (this.cornerThreePercentage * this.cornerThreeRate +
        this.aboveTheBreakThreePercentage * this.aboveTheBreakThreeRate) /
        this.threePointShotRate;
    },
  },
  // field goal percentages
  fgPercentage: averageGameStatsPerTeam.fgm / averageGameStatsPerTeam.fga,
  get twoFgPercentage() {
    return this.twoPointShot.cumulativeTwoPointPercentage;
  },
  get threeFgPercentage() {
    return this.threePointShot.cumulativeThreePointPercentage;
  },
  freeThrowPercentage: averageGameStatsPerTeam.ftm / averageGameStatsPerTeam.fta,

  shootingFouls: {
    foulsPerFga: 0.192 / 2, // doesn't include penalty FT trips
    // The below rates are rates per shooting foul, i.e. to determine what kind of foul it is.
    twoPointFoulRate: .75,
    threePointFoulRate: .05,
    andOneFoulRate: .20
  },
  nonShootingFouls: {
    // Penalty fouls will be a subset of this, based on counting fouls during a game.
    get nonShootingFoulRate() {
      const nonShootingFouls = averageGameStatsPerTeam.personalFouls -
        averageStatRates.shootingFouls.foulsPerFga * averageGameStatsPerTeam.fga;
      return nonShootingFouls / averageGameStatsPerTeam.possessions;
    },
    offensiveFoulRate: 0.15,
    deffensiveFoulRate: .85,
  },

  // counting stat rates
  assistRatePerMadeFga: averageGameStatsPerTeam.assists / averageGameStatsPerTeam.fgm,
  blockRatePerMissedFga: averageGameStatsPerTeam.blocks / averageGameStatsPerTeam.missedFg,
  stealRatePerTurnover: averageGameStatsPerTeam.steals / averageGameStatsPerTeam.turnovers,
  offensiveReboundRatePerMissedFga: averageGameStatsPerTeam.offensiveRebounds / averageGameStatsPerTeam.missedFg,
  defensiveReboundRatePerMissedFga: averageGameStatsPerTeam.defensiveRebounds / averageGameStatsPerTeam.missedFg,
  shotRate: averageGameStatsPerTeam.fga / averageGameStatsPerTeam.possessions,

  // the three events that can end a possession (with our simulation engine)
  possessionEndEvents: {
    get shotOrShootingFoulRate() {
      return averageStatRates.shootingFouls.foulsPerFga + averageStatRates.shotRate;
    },
    turnoverRate: averageGameStatsPerTeam.turnovers / averageGameStatsPerTeam.possessions,
    get nonShootingFoulDefensiveRate() {
      return averageStatRates.nonShootingFouls.nonShootingFoulRate *
        averageStatRates.nonShootingFouls.deffensiveFoulRate;
    },
  },

} as const;
