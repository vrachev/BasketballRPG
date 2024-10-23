import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';

import { Player } from '@data/schemas/player';
import { pickOption, determineAssist, determineShot } from '@simulation/possession';

beforeAll(() => {
  jest.spyOn(Math, 'random');
});

afterAll(() => {
  jest.spyOn(Math, 'random').mockRestore();
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
