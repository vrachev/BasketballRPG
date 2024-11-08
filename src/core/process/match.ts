import { insertGameResult } from '../entities/gameResult';
import { insertPlayerGameResults } from '../entities/playerGameResult';
import { updatePlayerSeason } from '../entities/playerSeason';
import { updateTeamSeason } from '../entities/teamSeason';
import { MatchInput, simulateMatch } from '../simulation/match';
import { PlayerEvent } from '../simulation/possession';
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

  // Update player seasons
  await updatePlayerSeasonStats(gameStats, matchInput.seasonStage);

  return gameStats;
};


const updateTeamSeasonStats = async (gameStats: GameStats) => {
  const { homeTeamStatline, awayTeamStatline } = gameStats;
  const homeStats = homeTeamStatline;
  const awayStats = awayTeamStatline;

  await updateTeamSeason(gameStats.homeTeam.teamSeason.id, homeStats, gameStats.winner === 'home');
  await updateTeamSeason(gameStats.awayTeam.teamSeason.id, awayStats, gameStats.winner === 'away');
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
