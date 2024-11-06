import { insertGameResult } from '../entities/gameResult';
import { insertPlayerGameResults } from '../entities/playerGameResult';
import { updateTeamSeason } from '../entities/teamSeason';
import { MatchInput, simulateMatch } from '../simulation/match';
import { calculateGameStats, GameStats } from './calculateGameStats';

export const processMatch = async (
  matchInput: MatchInput,
  date: Date
): Promise<GameStats> => {
  // Simulate match and calculate game stats
  const possessionResults = simulateMatch(matchInput);
  const gameStats = calculateGameStats(possessionResults, matchInput);

  // Insert game results
  const gameResultId = await insertGameResult({ gameStats, seasonStage: matchInput.seasonStage, date });
  await insertPlayerGameResults(gameStats, gameResultId, matchInput.seasonStage, date);

  // Update team seasons
  await updateTeamSeasonStats(gameStats);

  return gameStats;
};


const updateTeamSeasonStats = async (gameStats: GameStats) => {
  const { homeTeamStatline, awayTeamStatline } = gameStats;
  const homeStats = homeTeamStatline;
  const awayStats = awayTeamStatline;

  const isHomeTeamWin = homeStats.pts > awayStats.pts;
  await updateTeamSeason(gameStats.homeTeam.teamSeason.id, homeStats, isHomeTeamWin);
  await updateTeamSeason(gameStats.awayTeam.teamSeason.id, awayStats, !isHomeTeamWin);
};
