import { insertGameResult } from '../entities/gameResult';
import { insertPlayerGameResults } from '../entities/playerGameResult';
import { MatchInput, simulateMatch } from '../simulation/match';
import { calculateGameStats, GameStats } from './calculateGameStats';

export const processMatch = async (
  matchInput: MatchInput,
  date: Date
): Promise<GameStats> => {
  const possessionResults = simulateMatch(matchInput);
  const gameStats = calculateGameStats(possessionResults, matchInput);
  const gameResultId = await insertGameResult({ gameStats, seasonStage: matchInput.seasonStage, date });
  await insertPlayerGameResults(gameStats, gameResultId, matchInput.seasonStage, date);
  return gameStats;
};
