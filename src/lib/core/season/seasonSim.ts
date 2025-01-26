import * as core from '$lib/core/index.js';
import { getDb } from '$lib/data/index.js';
import { logger } from '$lib/logger.js';
import { simulationStore } from '$lib/stores/simulation';

export interface GameResult {
  homeTeam: string;
  awayTeam: string;
  winner: string;
}

export async function simulateDay(
  leagueId: string,
  seasonId: number
): Promise<GameResult[]> {
  logger.debug({ leagueId, seasonId }, 'Starting day simulation');

  // Load fresh schedule from DB to ensure we have latest state
  const schedule = await simulationStore.loadSchedule(leagueId, seasonId);
  if (!schedule || schedule.length === 0) {
    throw new Error('No more games to simulate in this season');
  }

  // Get earliest date from unprocessed games
  const nextDate = schedule[0].date.toISOString().split('T')[0];
  const todaysGames = schedule.filter(g =>
    g.date.toISOString().split('T')[0] === nextDate
  );

  const results = [];
  for (const game of todaysGames) {
    const result = await core.processMatch(game, seasonId);
    results.push({
      homeTeam: game.homeTeam.teamInfo.name,
      awayTeam: game.awayTeam.teamInfo.name,
      winner: result.winner === 'home' ? game.homeTeam.teamInfo.name : game.awayTeam.teamInfo.name
    });
  }

  return results;
}

export async function simulateWeek(
  leagueId: string,
  seasonId: number
): Promise<GameResult[]> {
  const results = [];
  for (let i = 0; i < 7; i++) {
    const dayResults = await simulateDay(leagueId, seasonId);
    results.push(...dayResults);
  }
  return results;
}

export async function simulateSeason(
  leagueId: string,
  seasonId: number
): Promise<void> {
  try {
    while (true) {
      await simulateDay(leagueId, seasonId);
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'No more games to simulate in this season') {
      return;
    }
    throw error;
  }
}

export async function getStandings(leagueId: string, seasonId: number): Promise<core.TeamStanding[]> {
  const db = await getDb(leagueId);
  return await core.getTeamStandings(seasonId, 'Eastern');
}
