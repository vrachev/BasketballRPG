import { MatchInput, simulateMatch } from '../simulation/match';
import { calculateGameStats, GameStats } from './calculateGameStats';

export const processMatch = (matchInput: MatchInput): GameStats => {
  const possessionResults = simulateMatch(matchInput);
  return calculateGameStats(possessionResults, matchInput);
};
