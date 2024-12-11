import * as core from '$lib/core/index.js';
import { getDb } from '$lib/data/index.js';
import { generateSchedule } from '$lib/core/season/createSchedule.js';
import type { MatchInput } from '$lib/core/simulation/match';
import { logger } from '$lib/logger.js';
import type { LeagueInfo } from '$lib/stores/league.js';
import { migrateDb } from '$lib/data/migrate.js';
import { v4 as uuid } from 'uuid';

const LEAGUES_STORAGE_KEY = 'bball-leagues';

function getStoredLeagues(): LeagueInfo[] {
  const stored = localStorage.getItem(LEAGUES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveLeagues(leagues: LeagueInfo[]): void {
  localStorage.setItem(LEAGUES_STORAGE_KEY, JSON.stringify(leagues));
}

// Track simulated games by their date string
const simulatedDates = new Map<number, Set<string>>();
const seasonSchedules = new Map<number, MatchInput[]>();

export async function createNewLeague(): Promise<LeagueInfo> {
  const leagues = getStoredLeagues();
  const now = new Date();
  const newLeague: LeagueInfo = {
    id: `league_${now.toISOString().split('T')[0]}_${uuid().substring(0, 3)}.db`,
    name: `League ${leagues.length + 1}`,
    createdAt: now.toISOString(),
    currentSeasonId: 0,
  };

  // Migrate the new league's database using the dedicated migration function
  await migrateDb(newLeague.id);

  // create db singleton
  await getDb(newLeague.id);

  // Create initial league data
  const seasonId = await core.createSeason(2024, 2025);
  newLeague.currentSeasonId = seasonId;

  // Create teams and players
  await core.createTeams();
  const teamIds = await core.getTeamIds();
  await core.createTeamSeason(teamIds, seasonId);

  // Create players for each team
  await createPlayers(teamIds);

  // Generate schedule using existing scheduler
  logger.info('Getting teams for schedule');
  const teams = await core.getTeams(2024);
  logger.info({ teamCount: teams.length }, 'Teams retrieved');

  logger.info('Generating schedule');
  const schedule = generateSchedule(teams, 'regular_season', 2024);
  logger.info({ gameCount: schedule.length }, 'Schedule generated');

  // Store schedule and initialize tracking
  seasonSchedules.set(seasonId, schedule);
  simulatedDates.set(seasonId, new Set());

  // Save the new league to localStorage
  leagues.push(newLeague);
  saveLeagues(leagues);

  logger.info({ leagueId: newLeague.id }, 'League created successfully');
  return newLeague;
}

// Helper function to create players
async function createPlayers(teamIds: number[]) {
  const rolePlayerTemplate: core.CreatePlayerInput = {
    playerInfoInput: { isStarting: true },
    teamId: 0,
    seasonStartingYear: 2024,
    position: 'PG',
    defaultSkillLevel: 35,
    defaultTendencyLevel: 20,
  };

  const starPlayerTemplate: core.CreatePlayerInput = {
    playerInfoInput: { isStarting: true },
    teamId: 0,
    seasonStartingYear: 2024,
    position: 'PG',
    defaultSkillLevel: 10,
    defaultTendencyLevel: 70
  };

  const positions = ['PG', 'SG', 'SF', 'PF', 'C'] as const;
  for (const teamId of teamIds) {
    for (let i = 0; i < positions.length; i++) {
      const template = i === 2 ? starPlayerTemplate : rolePlayerTemplate;
      await core.createPlayer({
        ...template,
        teamId: teamId,
        position: positions[i],
      });
    }
  }
}

export async function simulateDay(leagueId: number, seasonId: number): Promise<Array<{
  homeTeam: string;
  awayTeam: string;
  winner: string;
}>> {
  logger.debug({ leagueId, seasonId }, 'Starting day simulation');
  const schedule = seasonSchedules.get(seasonId);
  if (!schedule) throw new Error(`No schedule found for season ${seasonId}`);

  const simulated = simulatedDates.get(seasonId)!;

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

  simulated.add(nextDate);
  return results;
}

export async function simulateWeek(leagueId: number, seasonId: number): Promise<Array<{
  homeTeam: string;
  awayTeam: string;
  winner: string;
}>> {
  const results = [];
  for (let i = 0; i < 7; i++) {
    const dayResults = await simulateDay(leagueId, seasonId);
    results.push(...dayResults);
  }
  return results;
}

export async function simulateSeason(leagueId: number, seasonId: number): Promise<void> {
  const schedule = seasonSchedules.get(seasonId);
  if (!schedule) {
    throw new Error(`No schedule found for season ${seasonId}`);
  }

  // Keep simulating days until we get an error indicating no more games
  try {
    while (true) {
      await simulateDay(leagueId, seasonId);
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'No more games to simulate in this season') {
      // Expected error when season is complete
      return;
    }
    throw error; // Re-throw unexpected errors
  }
}

export async function getStandings(leagueId: string, seasonId: number): Promise<core.TeamStanding[]> {
  const db = await getDb(leagueId);
  return await core.getTeamStandings(seasonId, 'Eastern');
}
