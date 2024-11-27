import { insertGameResult } from '../entities/gameResult.js';
import { insertPlayerGameResults } from '../entities/playerGameResult.js';
import { updatePlayerSeason } from '../entities/playerSeason.js';
import { updateTeamSeason } from '../entities/teamSeason.js';
import { MatchInput, simulateMatch } from '../simulation/match.js';
import { calculateGameStats } from './calculateGameStats.js';
import { GameStats, PlayerEvent } from '../../data.js';

export const processMatch = async (
  matchInput: MatchInput,
): Promise<GameStats> => {
  // Simulate match and calculate game stats
  const possessionResults = simulateMatch(matchInput);
  const gameStats = calculateGameStats(possessionResults, matchInput);

  // Insert game results
  const gameResultId = await insertGameResult({ gameStats, seasonStage: matchInput.seasonStage, date: matchInput.date });
  await insertPlayerGameResults(gameStats, gameResultId, matchInput.seasonStage, matchInput.date);

  // Update team seasons
  await updateTeamSeasonStats(gameStats);

  // Update player seasons
  await updatePlayerSeasonStats(gameStats, matchInput.seasonStage);

  return gameStats;
};

const updateTeamSeasonStats = async (gameStats: GameStats) => {
  await updateTeamSeason(gameStats, "home");
  await updateTeamSeason(gameStats, "away");
};

const updatePlayerSeasonStats = async (
  gameStats: GameStats,
  seasonStage: 'regular_season' | 'playoffs'
): Promise<void> => {
  const { homePlayerStats, awayPlayerStats } = gameStats;

  const updateTeamPlayersSeasons = async (
    teamPlayerStats: PlayerEvent[],
    seasonStage: 'regular_season' | 'playoffs',
    team: typeof gameStats.homeTeam,
    isWin: boolean,
  ) => {
    for (const playerStats of teamPlayerStats) {
      const playerId = playerStats.pid;
      const player = team.players.find(p => p.playerInfo.id === playerId);
      if (!player) {
        throw new Error(`Player not found: ${playerId}`);
      }
      const playerSeason = seasonStage === 'regular_season'
        ? player?.regularSeason
        : player?.playoffSeason;
      if (!playerSeason) {
        throw new Error(`Invalid season stage: ${seasonStage} or missing playerSeason, ${JSON.stringify(playerStats, null, 2)}`);
      }
      const started = team.startingLineup.includes(player);
      await updatePlayerSeason(playerSeason.id, playerStats, isWin, started);
    }
  };

  await updateTeamPlayersSeasons(homePlayerStats, seasonStage, gameStats.homeTeam, gameStats.winner === 'home');
  await updateTeamPlayersSeasons(awayPlayerStats, seasonStage, gameStats.awayTeam, gameStats.winner === 'away');
};
