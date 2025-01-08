import { insertGameResult } from '../entities/gameResult.js';
import { insertPlayerGameResults } from '../entities/playerGameResult.js';
import { updatePlayerSeason } from '../entities/playerSeason.js';
import { updateTeamSeason } from '../entities/teamSeason.js';
import { simulateMatch } from '../simulation/match.js';
import { calculateGameStats } from './calculateGameStats.js';
import type { MatchInput } from '../simulation/match.js';
import type { GameStats, PlayerEvent } from '../../data/index.js';
import { logger } from '../../logger.js';
import { markGameAsProcessed } from '../entities/schedule.js';
import { getQueryStats } from "$lib/data/db";

export const processMatch = async (
  matchInput: MatchInput,
  seasonId: number,
): Promise<GameStats> => {
  const possessionResults = simulateMatch(matchInput);
  const gameStats = calculateGameStats(possessionResults, matchInput);

  const gameResultId = await insertGameResult({ gameStats, seasonStage: matchInput.seasonStage, date: matchInput.date });
  await insertPlayerGameResults(gameStats, gameResultId, matchInput.seasonStage, matchInput.date);
  await updateTeamSeasonStats(gameStats);
  await updatePlayerSeasonStats(gameStats, matchInput.seasonStage);
  await markGameAsProcessed(matchInput, seasonId);

  matchInput.isProcessed = true;

  logger.debug({
    homeTeam: matchInput.homeTeam.teamInfo.name,
    awayTeam: matchInput.awayTeam.teamInfo.name,
    date: matchInput.date
  }, "Processing match");

  const qs = getQueryStats();
  logger.info(`queries since last ${qs.totalQueries}`);
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
