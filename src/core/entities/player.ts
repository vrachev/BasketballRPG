import { faker } from '@faker-js/faker';
import { Player } from '../../data';
import { InsertDB } from '../../data/sqlTypes';
import { openDb } from '../../db';

const generatePlayer = (): InsertDB<Player> => {
  const firstName = faker.person.firstName('male');
  const lastName = faker.person.lastName('male');
  const fullName = `${firstName} ${lastName}`;

  const player: InsertDB<Player> = {
    // Personal Info
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,

    // Physical Info
    age: faker.number.float({ min: 18, max: 40 }),
    height: faker.number.float({ min: 70, max: 88 }),
    weight: faker.number.float({ min: 150, max: 400 }),
    wingspan: faker.number.float({ min: 68, max: 90 }),
    position: faker.helpers.arrayElement(['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center']),

    // Physical Skills
    strength: faker.number.float({ min: 0, max: 100 }),
    speed: faker.number.float({ min: 0, max: 100 }),
    lateral_quickness: faker.number.float({ min: 0, max: 100 }),
    shiftiness: faker.number.float({ min: 0, max: 100 }),
    vertical_jump: faker.number.float({ min: 0, max: 100 }),
    endurance: faker.number.float({ min: 0, max: 100 }),

    // Shooting Skills
    free_throw: faker.number.float({ min: 0, max: 100 }),
    // Two Point
    inside: faker.number.float({ min: 0, max: 100 }),
    layup: faker.number.float({ min: 0, max: 100 }),
    dunk: faker.number.float({ min: 0, max: 100 }),
    floater: faker.number.float({ min: 0, max: 100 }),
    turnaround: faker.number.float({ min: 0, max: 100 }),
    step_back: faker.number.float({ min: 0, max: 100 }),
    mid_range: faker.number.float({ min: 0, max: 100 }),
    two_point_fadeaway: faker.number.float({ min: 0, max: 100 }),
    // Three Point
    three_point_catch_and_shoot: faker.number.float({ min: 0, max: 100 }),
    three_point_step_back: faker.number.float({ min: 0, max: 100 }),
    three_point_pull_up: faker.number.float({ min: 0, max: 100 }),
    three_point_deep: faker.number.float({ min: 0, max: 100 }),

    // IQ
    offensive_iq: faker.number.float({ min: 0, max: 100 }),
    defensive_iq: faker.number.float({ min: 0, max: 100 }),
    patience: faker.number.float({ min: 0, max: 100 }),

    // Intangibles
    grit: faker.number.float({ min: 0, max: 100 }),
    leadership: faker.number.float({ min: 0, max: 100 }),
    clutch_gene: faker.number.float({ min: 0, max: 100 }),
    offensive_motor: faker.number.float({ min: 0, max: 100 }),
    defensive_motor: faker.number.float({ min: 0, max: 100 }),
    streakiness: faker.number.float({ min: 0, max: 100 }),
    handle_pressure: faker.number.float({ min: 0, max: 100 }),
    driven: faker.number.float({ min: 0, max: 100 }),
    emotional: faker.number.float({ min: 0, max: 100 }),

    // Basketball skills
    dribbling: faker.number.float({ min: 0, max: 100 }),
    playmaking: faker.number.float({ min: 0, max: 100 }),
    passing: faker.number.float({ min: 0, max: 100 }),
    offensive_rebounding: faker.number.float({ min: 0, max: 100 }),
    defensive_rebounding: faker.number.float({ min: 0, max: 100 }),
    post_game: faker.number.float({ min: 0, max: 100 }),

    // Tendencies
    // Playmaking tendencies
    tendency_pass: faker.number.float({ min: 0, max: 100 }),
    tendency_score: faker.number.float({ min: 0, max: 100 }),
    tendency_drive_to_basket: faker.number.float({ min: 0, max: 100 }),
    // Shot qualifier tendencies
    tendency_catch_and_shoot: faker.number.float({ min: 0, max: 100 }),
    tendency_pull_up: faker.number.float({ min: 0, max: 100 }),
    tendency_step_back: faker.number.float({ min: 0, max: 100 }),
    tendency_fadeaway: faker.number.float({ min: 0, max: 100 }),
    // Shot type tendencies
    tendency_mid_range: faker.number.float({ min: 0, max: 100 }),
    tendency_three_point: faker.number.float({ min: 0, max: 100 }),
    tendency_hook: faker.number.float({ min: 0, max: 100 }),
    tendency_post: faker.number.float({ min: 0, max: 100 }),
    // Rebounding tendencies
    tendency_offensive_rebounding: faker.number.float({ min: 0, max: 100 }),
    tendency_defensive_rebounding: faker.number.float({ min: 0, max: 100 }),

    // Career Info
    career_status: faker.helpers.arrayElement(['Active', 'Retired', 'Prospect']),
    experience: faker.number.int({ min: 0, max: 25 }),
    team_id: faker.number.int({ min: 1, max: 30 }),
  };
  return player;
};

const fetchPlayer = async (playerId: number): Promise<Player> => {
  const db = await openDb();
  const player = await db.get<Player>(`SELECT * FROM players WHERE id = ?`, [playerId]);
  if (!player) {
    throw new Error(`Player with id ${playerId} not found`);
  }
  return player;
};

const playerView = async (player: Player): Promise<PlayerView> => {
  return {
    ...player,
    team,
  };
};

export { generatePlayer, fetchPlayer, playerView };
