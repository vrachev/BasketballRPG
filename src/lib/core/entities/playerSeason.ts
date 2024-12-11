import { getDb, PLAYER_SEASON_TABLE, type PlayerEvent, type StatlineRaw, type PlayerSeasonTable } from '../../data/index.js';
import type { Updateable } from 'kysely';
import { logger } from '../../logger.js';

export const updatePlayerSeason = async (
  playerSeasonId: number,
  playerEvent: PlayerEvent,
  win: boolean,
  started: boolean
) => {
  const db = await getDb();
  const playerSeason = await db
    .selectFrom(PLAYER_SEASON_TABLE)
    .selectAll()
    .where('id', '=', playerSeasonId)
    .executeTakeFirstOrThrow();

  if (!playerSeason) {
    throw new Error(`Player season not found with ID: ${playerSeasonId}`);
  }
  const gamesPlayed = playerSeason.games_played;

  // Extract just the GameStatlineRaw properties by removing pid
  const { pid, ...playerStats }: { pid: number; } & StatlineRaw = playerEvent;

  // Calculate new stats
  const updates: Updateable<PlayerSeasonTable> = {
    ...playerStats,
    games_played: gamesPlayed + 1,
    games_started: started ? playerSeason.games_started + 1 : playerSeason.games_started,
    wins: win ? playerSeason.wins + 1 : playerSeason.wins,
    losses: !win ? playerSeason.losses + 1 : playerSeason.losses
  };

  // Add new stats to existing totals
  Object.entries(playerStats).forEach(([key, value]) => {
    updates[key as keyof StatlineRaw] = playerSeason[key as keyof StatlineRaw] + value;
  });

  try {
    await db
      .updateTable(PLAYER_SEASON_TABLE)
      .set(updates)
      .where('id', '=', playerSeasonId)
      .execute();
  } catch (e) {
    logger.error({ error: e }, "Failed to update player season stats");
    throw e;
  }
};
