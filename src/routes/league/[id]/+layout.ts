import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { getStoredLeagues } from '$lib/core/league/leagueManager';
import { currentLeague } from '$lib/stores/league';
import { getDb } from '$lib/data/db';
import { browser } from '$app/environment';

export const load: LayoutLoad = async ({ params }) => {
  // On server, return minimal data
  if (!browser) {
    return {
      league: {
        id: params.id,
        name: 'Loading...',
        createdAt: '',
        currentSeasonId: 0
      }
    };
  }

  // On client, load actual data
  const leagues = await getStoredLeagues();
  const league = leagues.find(l => l.id === params.id);

  if (!league) {
    throw error(404, `League not found`);
  }

  await getDb(league.id);
  currentLeague.set(league);

  return {
    league
  };
};
