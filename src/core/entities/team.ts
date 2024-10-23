import { faker } from '@faker-js/faker';
import { Team } from '../../data';
import { InsertableRecord } from '../../data/sqlTypes';

export interface Team {
  id: number;
  name: string;
  // ... other properties
}

const generateTeam = (): InsertableRecord<Team> => {
  const team: InsertableRecord<Team> = {
    name: faker.company.name(),
    city: faker.location.city(),
    abbreviation: faker.string.nanoid(3).toUpperCase(),
    mascot: faker.animal.type(),
    conference: faker.helpers.arrayElement(['Eastern', 'Western']),
    division: faker.helpers.arrayElement(['Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest']),
  };
  return team;
};

export { generateTeam };
