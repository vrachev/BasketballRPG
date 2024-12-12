import type { PageLoad } from './$types';
import { getLeagueById } from '$lib/core/league/leagueManager';
import { currentLeague } from '$lib/stores/league';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
  try {
    const league = await getLeagueById(params.id);

    if (!league) {
      throw error(404, `League not found - ${params.id}`);
    }

    currentLeague.set(league);

    return {
      league
    };
  } catch (e) {
    console.error('Error loading league:', e);
    throw error(404, 'League not found');
  }
}; 
