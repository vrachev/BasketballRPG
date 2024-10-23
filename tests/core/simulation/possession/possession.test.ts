import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';

import { pickShooter } from '@simulation/possession';

beforeAll(() => {
  jest.spyOn(Math, 'random');
});

afterAll(() => {
  jest.spyOn(Math, 'random').mockRestore();
});

describe('pickShooter', () => {
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
      const shooterIndex = pickShooter(shotTendencies);
      expect(shooterIndex).toBe(expectedIndex);
    });
  });

});
