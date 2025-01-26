import type { Team, Season } from "../types";
import type { MatchInput } from "$lib/core/simulation/match.js";
import { getSeason } from "$lib/core/entities/season";
import { getTeams } from "$lib/core/entities/team";
import { loadScheduleFromDb } from "$lib/stores/simulation";

/**
 * Todos:
 * 
 * 1) Cache constructor should fetch all required data for a league
 * 2) Code that currently writes/reads from DB will now call the cache instead
 * 3) Reading/writing will now be done at the cache layer, and cache will handle flushing to disk
 * 4) TBD on exactly when we will flush, but a few potential ideas:
 *    * when we change leagues
 *    * periodically during a season (eg 4 times during regular season, when playoffs are done, when draft is done etc..)
 *    * when a browser window is closed
 *    * 
 */

type CacheInput = {
  season: Season;
  teams: Team[];
  schedule: MatchInput[];
};

export class Cache {
  private static instance: Cache | null = null;
  leagueId: string;
  season: Season;
  teams: Team[];
  schedule: MatchInput[];

  private constructor(
    leagueId: string,
    season: Season,
    teams: Team[],
    schedule: MatchInput[]
  ) {
    this.leagueId = leagueId;
    this.season = season;
    this.teams = teams;
    this.schedule = schedule;
  }

  static async getInstance(leagueId: string, seasonId: number, params?: CacheInput): Promise<Cache> {
    if (!Cache.instance || Cache.instance.leagueId !== leagueId) {
      if (params) {
        Cache.instance = new Cache(leagueId, params.season, params.teams, params.schedule);
      } else {
        const season = await getSeason(seasonId);
        const teams = await getTeams(season.start_year);
        const schedule = await loadScheduleFromDb(leagueId, seasonId);
        Cache.instance = new Cache(leagueId, season, teams, schedule);
      }
    }
    return Cache.instance;
  }
}
