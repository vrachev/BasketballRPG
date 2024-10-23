import { z } from 'zod';

export const Lineup = z.object({
  players: z.array(z.number()).length(5),
});
export type Lineup = z.infer<typeof Lineup>;

export const PossessionLineup = Lineup.extend({
  possessionRole: z.enum(['offense', 'defense']),
});
export type PossessionLineup = z.infer<typeof PossessionLineup>;
