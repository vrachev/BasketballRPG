import { z } from 'zod';
import { Player } from './player';
import { Team } from './team';

export const Lineup = z.object({
  team: z.string(),
  players: z.array(z.string()).length(5),
});
export type Lineup = z.infer<typeof Lineup>;

export const PossessionLineup = Lineup.extend({
  possessionRole: z.enum(['offense', 'defense']),
});
export type PossessionLineup = z.infer<typeof PossessionLineup>;
