import { writable } from "svelte/store";

export type LeagueInfo = {
  id: string;
  name: string;
  createdAt: string;
  currentSeasonId: number;
};

export const currentLeague = writable<LeagueInfo | null>(null); 
