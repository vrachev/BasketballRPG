import { PLAYER_SEASON_TABLE, PlayerSeason, Statline } from '../../data';
import { update, openDb } from '../../db';
import { PlayerEvent } from '../simulation/possession';
import type { StatlineRaw } from '../../data';

export const updatePlayerSeason = async (
  playerSeasonId: number,
  playerEvent: PlayerEvent,
  win: boolean,
  started: boolean
) => {
  const db = await openDb();
  const playerSeason = await db.get<PlayerSeason>(`
    SELECT * FROM ${PLAYER_SEASON_TABLE} 
    WHERE id = ?
  `, playerSeasonId);

  if (!playerSeason) {
    throw new Error(`Player season not found with ID: ${playerSeasonId}`);
  }
  const gamesPlayed = playerSeason.games_played;

  // Extract just the GameStatlineRaw properties by removing pid
  const { pid, ...playerStats }: { pid: number; } & StatlineRaw = playerEvent;

  // Calculate new stats
  const updates: Partial<PlayerSeason> = {
    ...playerStats,
    games_played: gamesPlayed + 1,
    games_started: started ? playerSeason.games_started + 1 : playerSeason.games_started,
    wins: win ? playerSeason.wins + 1 : playerSeason.wins,
    losses: !win ? playerSeason.losses + 1 : playerSeason.losses
  };

  // Only update the stat fields with weighted averages if not the first game
  if (gamesPlayed > 0) {
    const oldWeight = gamesPlayed / (gamesPlayed + 1);
    const newWeight = 1 / (gamesPlayed + 1);

    Object.entries(playerStats).forEach(([key, value]) => {
      updates[key as keyof Statline] = playerSeason[key as keyof Statline] * oldWeight + value * newWeight;
    });
  }

  await update(playerSeasonId, updates, PLAYER_SEASON_TABLE);
};
