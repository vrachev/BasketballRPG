// https://shottracker.com/articles/the-3-point-revolution#:~:text=Five%20years%20after%20its%20inception,the%20trend%20is%20leveling%20off.

export const possessionConstants = {
  shotClock: 24,
  periodLength: 12 * 60,
  overtimePeriodLength: 5 * 60,
};

export const averageGameStatsPerTeam = {
  possessions: 99.1,
  FreeThrowPercentage: 0.784,
  FreeThrowAttempts: 21.7,
  fga: 88.9,
  twoPointShot: {
    rimRate: 0.32,
    rimPercentage: 0.66,
    paintRate: 0.16,
    paintPercentage: 0.435,
    midRangeRate: 0.19,
    midRangePercentage: 0.435,
    get twoPointShotRate() {
      return this.rimRate + this.paintRate + this.midRangeRate;
    },
  },
  threePointShot: {
    cornerThreeRate: 0.07,
    cornerThreePercentage: 0.4,
    aboveTheBreakThreeRate: 0.26,
    aboveTheBreakThreePercentage: 0.37,
    get threePointShotRate() {
      return this.cornerThreeRate + this.aboveTheBreakThreeRate;
    },
  },
  assistPercentage: 0.55,
  steals: 7.5,
  blocks: 5.1,
  turnovers: 13.6,
  offensiveRebounds: 10.6,
  defensiveRebounds: 33.0,
  get rebounds() {
    return this.offensiveRebounds + this.defensiveRebounds;
  },
  personalFouls: 18.7,
};
