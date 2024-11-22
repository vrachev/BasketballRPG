import { Insertable } from 'kysely';
import { db, GAME_RESULT_TABLE, prefixKeys, GameResultTable, GameStats } from '../../data';

export const insertGameResult = async (
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
  const homeStats = prefixKeys(gameStats.homeTeamStatline, 'h_') as {
    [K in keyof typeof gameStats.homeTeamStatline as `h_${string & K}`]: number
  };
  const awayStats = prefixKeys(gameStats.awayTeamStatline, 'a_') as {
    [K in keyof typeof gameStats.awayTeamStatline as `a_${string & K}`]: number
  };
  const winnerId = gameStats.winner === 'home'
    ? gameStats.homeTeam.teamInfo.id
    : gameStats.awayTeam.teamInfo.id;
  const loserId = gameStats.winner === 'home'
    ? gameStats.awayTeam.teamInfo.id
    : gameStats.homeTeam.teamInfo.id;

  const gameResult: Insertable<GameResultTable> = {
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
  };

  const result = await db
    .insertInto(GAME_RESULT_TABLE)
    .values(gameResult)
    .returning('id')
    .executeTakeFirstOrThrow();

  return result.id;
};
