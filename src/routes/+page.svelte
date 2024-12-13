<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { getStoredLeagues } from "$lib/core/league/leagueManager";
  import type { LeagueInfo } from "$lib/stores/league";
  import { currentLeague } from "$lib/stores/league";
  import { createNewLeague } from "$lib/core/league/leagueManager";
  import { logger } from "$lib/logger.js";

  let leagues: LeagueInfo[] = [];
  let creating = false;

  onMount(async () => {
    logger.debug("Fetching existing leagues");
    leagues = await getStoredLeagues();
  });

  async function handleCreateNewLeague() {
    creating = true;
    try {
      const league = await createNewLeague();
      currentLeague.set(league);
      await goto(`/league/${league.id}`, { replaceState: false });
    } finally {
      creating = false;
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">Basketball Legends</h1>
  <p class="text-xl mb-8">
    A basketball career simulation game where you can build your legacy!
  </p>

  <div class="space-y-6">
    <button
      on:click={handleCreateNewLeague}
      disabled={creating}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    >
      {creating ? "Creating League..." : "Create New League"}
    </button>

    {#if leagues.length > 0}
      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4">Your Leagues</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >League Name</th
                >
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >Created</th
                >
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >Season</th
                >
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each leagues as league}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <a
                      href="/league/{league.id}"
                      data-sveltekit-preload-data
                      class="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {league.name}
                    </a>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {new Date(league.createdAt).toLocaleDateString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    Season {league.currentSeasonId}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
</div>
