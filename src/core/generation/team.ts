import { faker } from '@faker-js/faker';
import { Team } from '../../data';

const generateTeam = (): Team => {
  const team: Team = {
    name: faker.company.name(),
    city: faker.location.city(),
    mascot: faker.animal.type(),
    conference: faker.helpers.arrayElement(['Eastern', 'Western']),
    division: faker.helpers.arrayElement(['Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest']),
  };
  return team;
};

export { generateTeam };
