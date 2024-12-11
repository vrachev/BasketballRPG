<script lang="ts">
  import { currentLeague } from "$lib/stores/league";
  import { goto } from "$app/navigation";
  import {
    simulateDay,
    simulateWeek,
    simulateSeason,
  } from "$lib/core/season/seasonSim";

  let simulating = false;
  let gameResults: Array<{
    homeTeam: string;
    awayTeam: string;
    winner: string;
  }> = [];

  async function handleSimulateDay() {
    if (!$currentLeague) return;
    simulating = true;
    try {
      gameResults = await simulateDay(
        $currentLeague.id,
        $currentLeague.currentSeasonId,
      );
    } finally {
      simulating = false;
    }
  }

  async function handleSimulateWeek() {
    simulating = true;
    try {
      gameResults = await simulateWeek(
        $currentLeague!.id,
        $currentLeague!.currentSeasonId,
      );
    } finally {
      simulating = false;
    }
  }

  async function handleSimulateSeason() {
    simulating = true;
    try {
      await simulateSeason($currentLeague!.id, $currentLeague!.currentSeasonId);
      gameResults = [];
    } finally {
      simulating = false;
    }
  }

  function viewStandings() {
    goto("/standings/");
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">League Management</h1>

  <div class="space-y-4">
    <div class="flex space-x-4">
      <button
        on:click={handleSimulateDay}
        disabled={simulating}
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        Simulate Day
      </button>

      <button
        on:click={handleSimulateWeek}
        disabled={simulating}
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        Simulate Week
      </button>

      <button
        on:click={handleSimulateSeason}
        disabled={simulating}
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        Simulate Season
      </button>
    </div>

    <button
      on:click={viewStandings}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      View Standings
    </button>

    {#if simulating}
      <div class="mt-4">
        <p class="text-gray-600">Simulation in progress...</p>
      </div>
    {/if}

    {#if gameResults.length > 0}
      <div class="mt-6">
        <h2 class="text-xl font-bold mb-4">Game Results</h2>
        <div class="space-y-2">
          {#each gameResults as result}
            <div class="p-4 bg-gray-50 rounded">
              {result.homeTeam} vs {result.awayTeam} - Winner: {result.winner}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
