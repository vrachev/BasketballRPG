import { writable } from 'svelte/store';
import type { MatchInput } from '$lib/core/simulation/match';

interface SimulationState {
  simulatedDates: Map<number, Set<string>>;
  seasonSchedules: Map<number, MatchInput[]>;
}

function createSimulationStore() {
  const { subscribe, set, update } = writable<SimulationState>({
    simulatedDates: new Map(),
    seasonSchedules: new Map()
  });

  return {
    subscribe,
    setSchedule: (seasonId: number, schedule: MatchInput[]) => update(state => {
      state.seasonSchedules.set(seasonId, schedule);
      if (!state.simulatedDates.has(seasonId)) {
        state.simulatedDates.set(seasonId, new Set());
      }
      return state;
    }),
    addSimulatedDate: (seasonId: number, date: string) => update(state => {
      const dates = state.simulatedDates.get(seasonId);
      if (dates) {
        dates.add(date);
      }
      return state;
    }),
    reset: () => set({
      simulatedDates: new Map(),
      seasonSchedules: new Map()
    })
  };
}

export const simulationStore = createSimulationStore(); 
