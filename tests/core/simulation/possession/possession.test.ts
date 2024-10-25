import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';

import { Player } from '@data/schemas/player';
import {
  pickOption,
  determineAssist,
  determineShot,
  determineTurnover,
  normalizeRates,
  Turnover,
  Steal
} from '@simulation/possession';
import { Lineup } from '@core/entities/lineup';

beforeAll(() => {
  jest.spyOn(Math, 'random');
});

afterAll(() => {
  jest.spyOn(Math, 'random').mockRestore();
});


describe('normalizeRates', () => {
  it('should normalize rates based on quantifiers', () => {
    const baseRates = [0.3, 0.4, 0.3];
    const quantifiers = [60, 50, 40];
    const medianValue = 50;

    const expectedNormalizedRates = [0.36, 0.4, 0.24]; // Example expected values

    const result = normalizeRates(baseRates, quantifiers, medianValue);
    expect(result).toEqual(expectedNormalizedRates.map(rate => parseFloat(rate.toFixed(4))));
  });
});


describe('pickOption', () => {
  it('should pick a shooter based on shooting tendencies', () => {
    const shotTendencies = [80, 60, 40, 20, 10];

    // Test multiple scenarios
    const testCases = [
      { random: 0.1, expectedIndex: 0 },
      { random: 0.5, expectedIndex: 1 },
      { random: 0.8, expectedIndex: 2 },
      { random: 0.95, expectedIndex: 3 },
      { random: 0.97, expectedIndex: 4 },
    ];

    testCases.forEach(({ random, expectedIndex }) => {
      (Math.random as jest.Mock).mockReturnValue(random);
      const shooterIndex = pickOption(shotTendencies);
      expect(shooterIndex).toBe(expectedIndex);
    });
  });

  it('should handle all inputs being 0', () => {
    const zeroTendencies = [0, 0, 0, 0, 0];

    // Test multiple scenarios
    const testCases = [
      { random: 0.1, expectedIndex: 0 },
      { random: 0.3, expectedIndex: 1 },
      { random: 0.5, expectedIndex: 2 },
      { random: 0.7, expectedIndex: 3 },
      { random: 0.9, expectedIndex: 4 },
    ];

    testCases.forEach(({ random, expectedIndex }) => {
      (Math.random as jest.Mock).mockReturnValue(random);
      const shooterIndex = pickOption(zeroTendencies);
      expect(shooterIndex).toBe(expectedIndex);
    });
  });
});


describe('determineAssist', () => {
  it('should determine an assister or no assist based on player skills and odds', () => {
    const players = [
      { skills: { passing: 70 } },
      { skills: { passing: 80 } },
      { skills: { passing: 60 } },
      { skills: { passing: 50 } },
    ] as Player[];

    const testCases = [
      { random: 0.1, expectedIndex: 0 },
      { random: 0.2, expectedIndex: 1 },
      { random: 0.4, expectedIndex: 2 },
      { random: 0.5, expectedIndex: 3 },
      { random: 0.55, expectedIndex: null },
    ];

    testCases.forEach(({ random, expectedIndex }) => {
      (Math.random as jest.Mock).mockReturnValue(random);
      const assister = determineAssist(players);
      if (expectedIndex === null) {
        expect(assister).toBeNull();
      } else {
        expect(assister).toBe(players[expectedIndex]);
      }
    });
  });
});

describe('determineShot', () => {
  it('should determine a shot attempt with correct shooter, assist, shot type, points, and free throws', () => {
    const players = [
      {
        skills: {
          passing: 60,
          mid_range: 80,
          three_point_catch_and_shoot: 75,
          three_point_corner: 40,
          dunk: 65,
          post: 70,
          tendency_score: 70,
          tendency_mid_range: 50,
          tendency_above_the_break_three: 35,
          tendency_corner_three: 40,
          tendency_drive_to_basket: 30,
          tendency_rim: 25,
          tendency_paint: 45
        }
      },
      {
        skills: {
          passing: 55,
          mid_range: 70,
          three_point_catch_and_shoot: 65,
          three_point_corner: 70,
          dunk: 60,
          post: 65,
          tendency_score: 65,
          tendency_mid_range: 45,
          tendency_above_the_break_three: 30,
          tendency_corner_three: 35,
          tendency_drive_to_basket: 25,
          tendency_rim: 20,
          tendency_paint: 40
        }
      },
      {
        skills: {
          passing: 65,
          mid_range: 85,
          three_point_catch_and_shoot: 80,
          three_point_corner: 70,
          dunk: 70,
          post: 75,
          tendency_score: 75,
          tendency_mid_range: 55,
          tendency_above_the_break_three: 40,
          tendency_corner_three: 45,
          tendency_drive_to_basket: 35,
          tendency_rim: 30,
          tendency_paint: 50
        }
      }
    ] as Player[];

    const testCases = [
      { randomValues: [0.1, 0.2, 0.3, 0.3, 0.9], expectedShooterIndex: 0, expectedAssistIndex: 1, expectedShotType: 'corner_three', expectedPoints: 3, expectedResult: 'made', expectedFts: 0 },
      { randomValues: [0.4, 0.5, 0.6, 0.8, 0.003], expectedShooterIndex: 1, expectedAssistIndex: 2, expectedShotType: 'above_the_break_three', expectedPoints: 3, expectedResult: 'missed', expectedFts: 3 },
      { randomValues: [0.4, 0.55, 0.9, 0.9, 0.5], expectedShooterIndex: 1, expectedAssistIndex: null, expectedShotType: 'paint', expectedPoints: 2, expectedResult: 'missed', expectedFts: 0 },
      { randomValues: [0.4, 0.55, 0.9, 0.9, 0.2], expectedShooterIndex: 1, expectedAssistIndex: null, expectedShotType: 'paint', expectedPoints: 2, expectedResult: 'missed', expectedFts: 2 },
    ];

    testCases.forEach(({ randomValues, expectedShooterIndex, expectedAssistIndex, expectedShotType, expectedPoints, expectedResult, expectedFts }) => {
      (Math.random as jest.Mock)
        .mockReturnValueOnce(randomValues[0])
        .mockReturnValueOnce(randomValues[1])
        .mockReturnValueOnce(randomValues[2])
        .mockReturnValueOnce(randomValues[3])
        .mockReturnValueOnce(randomValues[4]);
      const shotAttempt = determineShot(players);

      expect(shotAttempt.shooter).toBe(players[expectedShooterIndex]);
      if (expectedAssistIndex === null) {
        expect(shotAttempt.assist).toBeUndefined();
      } else {
        expect(shotAttempt.assist?.assister).toBe(players[expectedAssistIndex]);
      }
      expect(shotAttempt.shotType).toBe(expectedShotType);
      expect(shotAttempt.points).toBe(expectedPoints);
      expect(shotAttempt.result).toBe(expectedResult);
      expect(shotAttempt.fts).toBe(expectedFts);
    });
  });
});

describe('determineTurnover', () => {
  it('should correctly determine a turnover', () => {
    (Math.random as jest.Mock).mockReturnValue(0.4);

    const offensiveTeam: Lineup = {
      players: [
        { skills: { passing: 10 } },
        { skills: { passing: 30 } },
        { skills: { passing: 20 } },
        { skills: { passing: 65 } },
        { skills: { passing: 90 } },
      ],
    } as Lineup;

    const defensiveTeam: Lineup = {
      players: [
        { skills: { defensive_iq: 10 } },
        { skills: { defensive_iq: 98 } },
        { skills: { defensive_iq: 31 } },
        { skills: { defensive_iq: 11 } },
        { skills: { defensive_iq: 77 } },
      ],
    } as Lineup;

    const result = determineTurnover(offensiveTeam, defensiveTeam);

    expect(result.events).toHaveLength(2);
    expect(result.events[0].t).toBe('turnover');
    expect(result.events[1].t).toBe('steal');

    const turnover = result.events[0] as Turnover;
    expect(turnover.player).toBe(offensiveTeam.players[1]);
    expect(turnover.cause).toBe('steal');

    const steal = result.events[1] as Steal;
    expect(steal.ballHandler).toBe(turnover.player);
    expect(steal.stolenBy).toBe(defensiveTeam.players[1]);
  });
});
