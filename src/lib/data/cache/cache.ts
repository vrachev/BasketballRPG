import type { Team, Season } from "../types";
import type { MatchInput } from "$lib/core/simulation/match.js";

export class CacheManager {
  private caches: Map<string, Cache>;

  constructor() {
    this.caches = new Map();
  }

  get(leagueId: string): Cache {
    if (this.caches.has(leagueId)) return this.caches.get(leagueId)!;

    const cache = new Cache(leagueId);
    this.caches.set(leagueId, cache);
    return cache;
  }
}

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

export class Cache {
  private static instance: Cache | null = null;
  private season: Season;
  private teams: Team[];
  private schedule: MatchInput[];

  constructor(leagueId: string) {
  }

  // private constructor(season: Season, teams: Team[], schedule: MatchInput[]) {
  //   this.season = season;
  //   this.teams = teams;
  //   this.schedule = schedule;
  // }

  // public static getInstance(season?: Season, teams?: Team[], schedule?: MatchInput[]): Cache {
  //   if (!Cache.instance) {
  //     if (!season || !teams || !schedule) {
  //       throw new Error('Cache must be initialized with data on first call');
  //     }
  //     Cache.instance = new Cache(season, teams, schedule);
  //   }
  //   return Cache.instance;
  // }

  public getSeason(): Season {
    return this.season;
  }

  public getTeams(): Team[] {
    return this.teams;
  }

  public getSchedule(): MatchInput[] {
    return this.schedule;
  }
}

