import { faker } from '@faker-js/faker';

const generatePlayer = () => {
  const firstName = faker.person.firstName('male');
  const lastName = faker.person.lastName('male');
  const fullName = `${firstName} ${lastName}`;

  const player = {
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    age: faker.number.int({ min: 18, max: 40 }),
    height: faker.number.int({ min: 70, max: 88 }),
    weight: faker.number.int({ min: 150, max: 400 }),
    team: faker.company.name(),
    position: "Shooting Guard",
    status: "Active",
    offensive_rating: faker.number.float({ min: 0, max: 100 }),
    defensive_rating: faker.number.float({ min: 0, max: 100 }),
    grit: faker.number.float({ min: 0, max: 100 }),
    leadership: faker.number.float({ min: 0, max: 100 }),
    experience: faker.number.int({ min: 0, max: 25 }),
  }
  return player;
}

export { generatePlayer };
