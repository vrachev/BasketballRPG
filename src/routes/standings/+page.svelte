<script lang="ts">
  import { onMount } from "svelte";
  import { currentLeague } from "$lib/stores/league";
  import type { TeamStanding } from "$lib/core/entities/views/teamStandings";
  import { getStandings } from "$lib/core/season/seasonSim";
  import { logger } from "$lib/logger.js";
  let standings: TeamStanding[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      logger.debug({ leagueId: $currentLeague?.id }, "Fetching standings");
      standings = await getStandings(
        $currentLeague!.id,
        $currentLeague!.currentSeasonId,
      );
      logger.trace({ standings }, "Received standings data");
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown error occurred";
      logger.error({ error: e }, "Failed to fetch standings");
    } finally {
      loading = false;
    }
  });
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">League Standings</h1>

  {#if loading}
    <p class="text-gray-600">Loading standings...</p>
  {:else if error}
    <p class="text-red-600">Error: {error}</p>
  {:else if standings.length === 0}
    <p class="text-gray-600">No standings data available</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 text-left">Rank</th>
            <th class="px-4 py-2 text-left">Team</th>
            <th class="px-4 py-2 text-left">W-L</th>
            <th class="px-4 py-2 text-left">PCT</th>
            <th class="px-4 py-2 text-left">GB</th>
            <th class="px-4 py-2 text-left">Home</th>
            <th class="px-4 py-2 text-left">Away</th>
            <th class="px-4 py-2 text-left">Conf</th>
            <th class="px-4 py-2 text-left">PPG</th>
          </tr>
        </thead>
        <tbody>
          {#each standings as team}
            <tr class="border-t hover:bg-gray-50">
              <td class="px-4 py-2">{team.conferenceRank}</td>
              <td class="px-4 py-2">{team.city} {team.name}</td>
              <td class="px-4 py-2">
                {team.totalRecord.wins}-{team.totalRecord.losses}
              </td>
              <td class="px-4 py-2">{team.winPct.toFixed(3)}</td>
              <td class="px-4 py-2">
                {team.gamesBack === 0 ? "-" : team.gamesBack.toFixed(1)}
              </td>
              <td class="px-4 py-2">
                {team.homeRecord.wins}-{team.homeRecord.losses}
              </td>
              <td class="px-4 py-2">
                {team.awayRecord.wins}-{team.awayRecord.losses}
              </td>
              <td class="px-4 py-2">
                {team.conferenceRecord.wins}-{team.conferenceRecord.losses}
              </td>
              <td class="px-4 py-2">{team.ppg.toFixed(1)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
