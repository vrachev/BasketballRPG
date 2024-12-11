<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { currentLeague } from "$lib/stores/league";
  import { createNewLeague } from "$lib/core/season/seasonSim";
  import { logger } from "$lib/logger.js";
  import "$lib/data/migrate";

  let leagues: { id: string; name: string }[] = [];
  let creating = false;

  onMount(async () => {
    // TODO: In the future, we might want to store multiple leagues
    leagues = [];

    logger.debug("Checking for existing leagues");
  });

  async function handleCreateNewLeague() {
    creating = true;
    try {
      const league = await createNewLeague();
      currentLeague.set(league);
      await goto("/league/");
    } finally {
      creating = false;
    }
  }

  function selectLeague(leagueId: string) {
    currentLeague.set({
      id: leagueId,
      name: "",
      createdAt: "",
      currentSeasonId: 0,
    });
    goto("/league/");
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
        <h2 class="text-2xl font-bold mb-4">Existing Leagues</h2>
        <div class="space-y-2">
          {#each leagues as league}
            <button
              on:click={() => selectLeague(league.id)}
              class="w-full text-left px-4 py-2 border rounded hover:bg-gray-100"
            >
              {league.name}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
