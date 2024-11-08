import { GAME_RESULT_TABLE, GameResult, InsertableRecord, prefixKeys } from '../../data';
import { insert } from '../../db';
import { GameStats } from '../process/calculateGameStats';

export const insertGameResult = (
  {
    gameStats,
    seasonStage,
    date,
  }: {
    gameStats: GameStats;
    seasonStage: 'regular_season' | 'playoffs';
    date: Date;
  }
): Promise<number> => {
  const homeStats = prefixKeys(gameStats.homeTeamStatline, 'h_') as Partial<GameResult>;
  const awayStats = prefixKeys(gameStats.awayTeamStatline, 'a_') as Partial<GameResult>;
  const winnerId = gameStats.winner === 'home'
    ? gameStats.homeTeam.teamInfo.id
    : gameStats.awayTeam.teamInfo.id;
  const loserId = gameStats.winner === 'home'
    ? gameStats.awayTeam.teamInfo.id
    : gameStats.homeTeam.teamInfo.id;
  const gameResult = {
    home_team_id: gameStats.homeTeam.teamInfo.id,
    away_team_id: gameStats.awayTeam.teamInfo.id,
    home_team_season_id: gameStats.homeTeam.teamSeason.id,
    away_team_season_id: gameStats.awayTeam.teamSeason.id,
    season_id: gameStats.homeTeam.teamSeason.season_id,
    season_type: seasonStage,
    date: date.toISOString(),
    winner_id: winnerId,
    loser_id: loserId,
    ...homeStats,
    ...awayStats,
  } as InsertableRecord<GameResult>;
  return insert(gameResult, GAME_RESULT_TABLE);
};
