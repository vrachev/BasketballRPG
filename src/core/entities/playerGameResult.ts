import { PLAYER_GAME_RESULT_TABLE, PlayerGameResult, InsertableRecord } from '../../data';
import { insert } from '../../db';

import { GameStats } from '../process/calculateGameStats';

export const insertPlayerGameResults = async (
  gameStats: GameStats,
  gameResultId: number,
  seasonStage: 'regular_season' | 'playoffs',
  date: Date,
): Promise<number[]> => {
  const homePlayerGameResults: InsertableRecord<PlayerGameResult>[] = gameStats.homePlayerStats.map((player) => {
    const { pid, ...playerStats } = player;
    return {
      player_id: pid,
      game_result_id: gameResultId,
      team_id: gameStats.homeTeam.teamInfo.id,
      season_id: gameStats.homeTeam.teamSeason.season_id,
      season_type: seasonStage,
      date: date.toISOString(),
      win: gameStats.homeTeamStatline.pts > gameStats.awayTeamStatline.pts ? 1 : 0,
      ...playerStats,
    };
  });

  const awayPlayerGameResults: InsertableRecord<PlayerGameResult>[] = gameStats.awayPlayerStats.map((player) => {
    const { pid, ...playerStats } = player;
    return {
      player_id: pid,
      game_result_id: gameResultId,
      team_id: gameStats.awayTeam.teamInfo.id,
      season_id: gameStats.awayTeam.teamSeason.season_id,
      season_type: seasonStage,
      date: date.toISOString(),
      win: gameStats.awayTeamStatline.pts > gameStats.homeTeamStatline.pts ? 1 : 0,
      ...playerStats,
    };
  });

  const playerGameResults = [...homePlayerGameResults, ...awayPlayerGameResults];
  const ids: number[] = [];
  for (const playerGameResult of playerGameResults) {
    const id = await insert(playerGameResult, PLAYER_GAME_RESULT_TABLE);
    ids.push(id);
  }

  return ids;
};
