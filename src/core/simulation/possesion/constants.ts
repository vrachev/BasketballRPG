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
};

export const playerConstants = {
  leagueAverageSkill: 50,
};

export const averageGameStatsPerTeam = {
  possessions: 100.0,
  fga: 88.6,
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
  assistPercentage: 0.55,
  steals: 7.7,
  blocks: 5.9,
  turnovers: 14.7,
  offensiveRebounds: 11.6,
  defensiveRebounds: 32.9,
  get rebounds() {
    return this.offensiveRebounds + this.defensiveRebounds;
  },
  FreeThrowPercentage: 0.763,
  FreeThrowAttempts: 27.3,
  FreeThrowsPerFGA: 0.21, // this is FTs from shooting fouls only, not eg: bonus penalty.
  get freeThrowsFromShootingFouls() {
    return this.FreeThrowsPerFGA * this.fga;
  },
  get freeThrowsFromNonShootingFouls() {
    return this.FreeThrowAttempts - this.freeThrowsFromShootingFouls;
  },
  get twoPointerFGA() {
    return this.twoPointShot.twoPointShotRate * this.fga;
  },
  get threePointerFGA() {
    return this.threePointShot.threePointShotRate * this.fga;
  },
  get madeTwoPointers() {
    return this.twoPointerFGA * this.twoPointShot.cumulativeTwoPointPercentage;
  },
  get madeThreePointers() {
    return this.threePointerFGA * this.threePointShot.cumulativeThreePointPercentage;
  },
  get twoPointFoulRate() {
    const missedTwoPointers = this.twoPointerFGA - this.madeTwoPointers;
    const twoPointFoulRatePerGame = this.FreeThrowsPerFGA * 0.7 * this.fga / 2;
    return twoPointFoulRatePerGame / missedTwoPointers;
  },
  get threePointFoulRate() {
    const missedThreePointers = this.threePointerFGA - this.madeThreePointers;
    const threePointFoulRatePerGame = this.FreeThrowsPerFGA * 0.1 * this.fga / 3;
    return threePointFoulRatePerGame / missedThreePointers;
  },
  // does not yet support and-one from three-point shots.
  get andOneFoulRate() {
    const andOneFoulRatePerGame = this.FreeThrowsPerFGA * 0.20 * this.twoPointShot.twoPointShotRate * this.fga / 1;
    return andOneFoulRatePerGame / this.madeTwoPointers;
  },
  // Free throw eligible fouls from non-shooting fouls (only supports 2 shot bonus fouls right now).
  get nonShootingFoulFreeThrowRate() {
    return this.freeThrowsFromNonShootingFouls / this.possessions / 2;
  },

  personalFouls: 22.3,
};
