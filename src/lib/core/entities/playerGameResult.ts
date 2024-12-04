import { getDb } from '../../data/index.js';
import type { Insertable } from 'kysely';
import { PLAYER_GAME_RESULT_TABLE, type PlayerGameResultTable, type GameStats } from '../../data/index.js';

export const insertPlayerGameResults = async (
  gameStats: GameStats,
  gameResultId: number,
  seasonStage: 'regular_season' | 'playoffs',
  date: Date,
): Promise<number[]> => {
  const homePlayerGameResults: Insertable<PlayerGameResultTable>[] = gameStats.homePlayerStats.map((player) => {
    const { pid, ...playerStats } = player;
    return {
      player_id: pid,
      game_result_id: gameResultId,
      team_id: gameStats.homeTeam.teamInfo.id,
      season_id: gameStats.homeTeam.teamSeason.season_id,
      season_type: seasonStage,
      date: date.toISOString(),
      win: gameStats.winner === 'home' ? 1 : 0,
      ...playerStats,
    };
  });

  const awayPlayerGameResults: Insertable<PlayerGameResultTable>[] = gameStats.awayPlayerStats.map((player) => {
    const { pid, ...playerStats } = player;
    return {
      player_id: pid,
      game_result_id: gameResultId,
      team_id: gameStats.awayTeam.teamInfo.id,
      season_id: gameStats.awayTeam.teamSeason.season_id,
      season_type: seasonStage,
      date: date.toISOString(),
      win: gameStats.winner === 'away' ? 1 : 0,
      ...playerStats,
    };
  });

  const playerGameResults = [...homePlayerGameResults, ...awayPlayerGameResults];
  const ids: number[] = [];
  const db = await getDb();
  for (const playerGameResult of playerGameResults) {
    const res = await db
      .insertInto(PLAYER_GAME_RESULT_TABLE)
      .values(playerGameResult)
      .returning('id')
      .executeTakeFirstOrThrow();
    ids.push(res.id);
  }

  return ids;
};
