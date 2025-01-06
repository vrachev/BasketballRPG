import { writable } from 'svelte/store';
import type { MatchInput } from '$lib/core/simulation/match';
import { getDb } from '$lib/data/db';
import { SCHEDULE_TABLE } from '$lib/data/constants';
import { getTeams } from '$lib/core/entities/team';
import { logger } from '$lib/logger';
import { Cache } from '$lib/data/cache/cache';

interface SimulationState {
  seasonSchedules: Map<number, MatchInput[]>;
}

async function loadScheduleFromDb(seasonId: number): Promise<MatchInput[]> {
  try {
    const cache = Cache.getInstance();
    const cachedSchedule = cache.getSchedule();
    if (cachedSchedule.length > 0) {
      return cachedSchedule;
    }
  } catch (e) {
    logger.debug('Cache not initialized, loading from DB');
  }

  const db = await getDb();
  const schedules = await db
    .selectFrom(SCHEDULE_TABLE)
    .select(['home_team_id', 'away_team_id', 'date', 'season_type'])
    .where('season_id', '=', seasonId)
    .where('is_processed', '=', 0)
    .orderBy('date', 'asc')
    .execute();

  const season = await db
    .selectFrom('season')
    .select(['id', 'start_year', 'end_year'])
    .where('id', '=', seasonId)
    .executeTakeFirstOrThrow();

  const teams = await getTeams(season.start_year);
  const teamsMap = new Map(teams.map(team => [team.teamInfo.id, team]));

  const schedule = schedules.map(schedule => ({
    homeTeam: teamsMap.get(schedule.home_team_id)!,
    awayTeam: teamsMap.get(schedule.away_team_id)!,
    date: new Date(schedule.date),
    seasonStage: schedule.season_type as 'regular_season' | 'playoffs',
    isProcessed: false
  }));

  Cache.getInstance(season, teams, schedule);
  return schedule;
}

async function saveScheduleToDb(seasonId: number, schedule: MatchInput[]): Promise<void> {
  const db = await getDb();
  await db
    .deleteFrom(SCHEDULE_TABLE)
    .where('season_id', '=', seasonId)
    .execute();

  await db
    .insertInto(SCHEDULE_TABLE)
    .values(
      schedule.map(match => ({
        season_id: seasonId,
        home_team_id: match.homeTeam.teamInfo.id,
        away_team_id: match.awayTeam.teamInfo.id,
        date: match.date.toISOString().slice(0, 10),
        season_type: match.seasonStage,
        is_processed: 0
      }))
    )
    .execute();
}

function createSimulationStore() {
  const { subscribe, set, update } = writable<SimulationState>({
    seasonSchedules: new Map()
  });

  return {
    subscribe,
    setSchedule: async (seasonId: number, schedule: MatchInput[]) => {
      await saveScheduleToDb(seasonId, schedule);
      update(state => {
        state.seasonSchedules.set(seasonId, schedule);
        return state;
      });
    },
    loadSchedule: async (seasonId: number) => {
      const schedule = await loadScheduleFromDb(seasonId);
      logger.debug({ schedule });
      logger.debug({ schedule }, 'Loaded schedule');
      update(state => {
        state.seasonSchedules.set(seasonId, schedule);
        return state;
      });
      return schedule;
    },
    markProcessed: async (seasonId: number, date: string) => {
      await loadScheduleFromDb(seasonId);
    },
    reset: () => set({
      seasonSchedules: new Map()
    })
  };
}

export const simulationStore = createSimulationStore(); 
