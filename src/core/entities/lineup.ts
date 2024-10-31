import { Player } from '../../data';

export type Lineup = {
  team: string;
  players: Player[];
};

export type PossessionLineup = Lineup & {
  possessionRole: 'offense' | 'defense';
};
