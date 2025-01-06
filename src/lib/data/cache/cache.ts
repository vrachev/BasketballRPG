import type { Team, Season } from "../types";
import type { MatchInput } from "$lib/core/simulation/match.js";

export class Cache {
  private static instance: Cache | null = null;
  private season: Season;
  private teams: Team[];
  private schedule: MatchInput[];

  private constructor(season: Season, teams: Team[], schedule: MatchInput[]) {
    this.season = season;
    this.teams = teams;
    this.schedule = schedule;
  }

  public static getInstance(season?: Season, teams?: Team[], schedule?: MatchInput[]): Cache {
    if (!Cache.instance) {
      if (!season || !teams || !schedule) {
        throw new Error('Cache must be initialized with data on first call');
      }
      Cache.instance = new Cache(season, teams, schedule);
    }
    return Cache.instance;
  }

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
