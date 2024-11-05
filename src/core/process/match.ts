import { insertGameResult } from '../entities/gameResult';
import { MatchInput, simulateMatch } from '../simulation/match';
import { calculateGameStats, GameStats } from './calculateGameStats';

export const processMatch = (
  matchInput: MatchInput,
  date: Date
): GameStats => {
  const possessionResults = simulateMatch(matchInput);
  const gameStats = calculateGameStats(possessionResults, matchInput);
  insertGameResult({ gameStats, seasonStage: matchInput.seasonStage, date });
  return gameStats;
};
