import { writable } from "svelte/store";
import { browser } from '$app/environment';

export type LeagueInfo = {
  id: string;
  name: string;
  createdAt: string;
  currentSeasonId: number;
};

export const currentLeague = writable<LeagueInfo | null>(null); 
