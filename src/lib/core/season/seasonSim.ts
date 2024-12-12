import * as core from '$lib/core/index.js';
import { getDb } from '$lib/data/index.js';
import type { MatchInput } from '$lib/core/simulation/match';
import { logger } from '$lib/logger.js';
import { get } from 'svelte/store';
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

  const simState = get(simulationStore);
  const schedule = simState.seasonSchedules.get(seasonId);
  if (!schedule) throw new Error(`No schedule found for season ${seasonId}`);

  const simulated = simState.simulatedDates.get(seasonId)!;

  // Find next unplayed date
  const nextGames = schedule
    .filter(game => !simulated.has(game.date.toISOString().split('T')[0]))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (nextGames.length === 0) {
    throw new Error('No more games to simulate in this season');
  }

  const nextDate = nextGames[0].date.toISOString().split('T')[0];
  const todaysGames = nextGames.filter(g =>
    g.date.toISOString().split('T')[0] === nextDate
  );

  const results = [];
  for (const game of todaysGames) {
    const result = await core.processMatch(game);
    results.push({
      homeTeam: game.homeTeam.teamInfo.name,
      awayTeam: game.awayTeam.teamInfo.name,
      winner: result.winner === 'home' ? game.homeTeam.teamInfo.name : game.awayTeam.teamInfo.name
    });
  }

  simulationStore.addSimulatedDate(seasonId, nextDate);
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
  const simState = get(simulationStore);
  const schedule = simState.seasonSchedules.get(seasonId);
  if (!schedule) {
    throw new Error(`No schedule found for season ${seasonId}`);
  }

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
