import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';

import { Player } from '@data/schemas/player';
import { pickOption, determineAssist, determineShot, normalizeRates } from '@simulation/possession';

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

/**
 * [70, 80, 60, 50, 244.4]
 */
