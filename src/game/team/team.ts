import { faker } from '@faker-js/faker';
import { teamSchema } from '../../data/schemas/teamSchema';

const generateTeam = (): teamSchema => {
  const team: teamSchema = {
    name: faker.company.name(),
    city: faker.location.city(),
    mascot: faker.animal.type(),
    conference: faker.helpers.arrayElement(['Eastern', 'Western']),
    division: faker.helpers.arrayElement(['Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest']),
  };
  return team;
};

export { generateTeam };
