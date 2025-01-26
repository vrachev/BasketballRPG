import { v4 as uuid } from 'uuid';

import * as core from '$lib/core/index.js';
import type { LeagueInfo } from "$lib/stores/league";
import { browser } from "$app/environment";
import { logger } from "$lib/logger.js";
import { generateSchedule } from "../season/createSchedule";
import getDb from "$lib/data/db";
import { getQueryStats } from "$lib/data/db";
import { migrateDb } from '$lib/data/migrate.js';
import { simulationStore } from '$lib/stores/simulation';
import { Cache } from '$lib/data/cache/cache';
import { getSeason } from '$lib/core/entities/season';


const LEAGUES_STORAGE_KEY = 'bball-leagues';

export function getStoredLeagues(): LeagueInfo[] {
  // if (!browser) return [];
  const stored = localStorage.getItem(LEAGUES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getLeagueById(id: string): LeagueInfo | undefined {
  const league = getStoredLeagues().find(league => league.id === id);
  logger.debug("Retrieved league by id", { id, found: !!league });
  return league;
}

export function saveLeague(league: LeagueInfo): void {
  // if (!browser) return;
  const leagues = getStoredLeagues();
  const index = leagues.findIndex(l => l.id === league.id);

  if (index >= 0) {
    leagues[index] = league;
    logger.debug("Updated existing league", { id: league.id });
  } else {
    leagues.push(league);
    logger.debug("Added new league", { id: league.id });
  }

  localStorage.setItem(LEAGUES_STORAGE_KEY, JSON.stringify(leagues));
}

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

  // TODO fix hardcoded year
  const startingYear = 2024;
  const seasonId = await core.createSeason(startingYear, startingYear + 1);
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

  // Initialize cache singleton with all required data
  const season = await getSeason(startingYear);
  Cache.getInstance(newLeague.id, season.id, { season, teams, schedule });

  // Store schedule and initialize tracking
  simulationStore.setSchedule(seasonId, schedule);

  // Save the new league to localStorage
  saveLeague(newLeague);

  logger.info({ leagueId: newLeague.id }, 'League created successfully');
  logger.info(`total number of calls ${getQueryStats().totalQueries}`);
  return newLeague;
}

// Helper function to create players
async function createPlayers(teamIds: number[]) {
  const rolePlayerTemplate: core.CreatePlayerInput = {
    playerInfoInput: { isStarting: true },
    teamId: 0,
    position: 'PG',
    defaultSkillLevel: 35,
    defaultTendencyLevel: 20,
  };

  const starPlayerTemplate: core.CreatePlayerInput = {
    playerInfoInput: { isStarting: true },
    teamId: 0,
    position: 'PG',
    defaultSkillLevel: 10,
    defaultTendencyLevel: 70
  };

  const positions = ['PG', 'SG', 'SF', 'PF', 'C'] as const;
  const inputs: core.CreatePlayerInput[] = [];
  for (const teamId of teamIds) {
    for (let i = 0; i < positions.length; i++) {
      const template = i === 2 ? starPlayerTemplate : rolePlayerTemplate;
      inputs.push({
        ...template,
        teamId: teamId,
        position: positions[i],
      });
    }
  }

  await core.createPlayers(inputs, 2024);
}
