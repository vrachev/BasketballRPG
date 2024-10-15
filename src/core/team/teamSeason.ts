import { faker } from '@faker-js/faker';
import { teamSeasonSchema } from '../../data';

const generateTeamSeason = (teamId: number, year: number): teamSeasonSchema => {
  const wins = faker.number.int({ min: 0, max: 82 });
  const offensive_rating = faker.number.float({ min: 90, max: 120, fractionDigits: 1 });
  const defensive_rating = faker.number.float({ min: 90, max: 120, fractionDigits: 1 });

  const teamSeason: teamSeasonSchema = {
    team_id: teamId,
    year: year,
    wins: wins,
    losses: 82 - wins,
    conference_rank: faker.number.int({ min: 1, max: 15 }),
    playoff_seed: faker.number.int({ min: 1, max: 8 }),
    offensive_rating: offensive_rating,
    defensive_rating: defensive_rating,
    net_rating: Number((offensive_rating - defensive_rating).toFixed(1)),
    pace: faker.number.float({ min: 90, max: 105, fractionDigits: 1 }),
  };

  return teamSeason;
};

export { generateTeamSeason };
