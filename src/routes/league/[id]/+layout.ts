// import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getStoredLeagues } from '$lib/core/league/leagueManager';
import { currentLeague } from '$lib/stores/league';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';
import { getDb } from '$lib/data/db';
export const load: LayoutLoad = async ({ params }) => {
  const leagues = await getStoredLeagues();
  const league = leagues.find(l => l.id === params.id);

  if (!league) {
    throw error(404, 'League not found');
  }

  // Init db singleton for current league
  await getDb(league.id);

  // Set the current league if it's not already set or different
  const current = get(currentLeague);
  if (!current || current.id !== league.id) {
    currentLeague.set(league);
  }

  return {
    league
  };
};
