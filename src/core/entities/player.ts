import { faker } from '@faker-js/faker';
import { Player, PLAYER_TABLE, PlayerRaw, PlayerSeason, PLAYER_SEASON_TABLE, PlayerSkills, PLAYER_SKILLS_TABLE } from '../../data';
import { InsertableRecord } from '../../data/sqlTypes';
import { openDb } from '../../db';
import { PlayerHistory } from '@src/data/schemas/player';

const generatePlayer = (): InsertableRecord<PlayerRaw> => {
  const firstName = faker.person.firstName('male');
  const lastName = faker.person.lastName('male');
  const fullName = `${firstName} ${lastName}`;

  const player: InsertableRecord<PlayerRaw> = {
    // Personal Info
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,

    // Physical Info
    age: faker.number.float({ min: 18, max: 40 }),
    height: faker.number.float({ min: 70, max: 88 }),
    weight: faker.number.float({ min: 150, max: 400 }),
    wingspan: faker.number.float({ min: 68, max: 90 }),

    // Career Info
    career_status: faker.helpers.arrayElement(['Active', 'Retired', 'Prospect']),
    experience: faker.number.int({ min: 0, max: 25 }),
  };
  return player;
};

const fetchPlayerHistory = async (playerId: number, currentYear: number): Promise<PlayerHistory> => {
  const db = await openDb();
  const playerData = await db.get<PlayerRaw>(`SELECT * FROM ${PLAYER_TABLE} WHERE id = ?`, [playerId]);
  const regularSeasons = await db.all<PlayerSeason[]>(`SELECT * FROM ${PLAYER_SEASON_TABLE} WHERE player_id = ? AND season_type = 'regular_season'`, [playerId]);
  const playoffSeasons = await db.all<PlayerSeason[]>(`SELECT * FROM ${PLAYER_SEASON_TABLE} WHERE player_id = ? AND season_type = 'playoffs'`, [playerId]);
  const skills = await db.all<PlayerSkills[]>(`SELECT * FROM ${PLAYER_SKILLS_TABLE} WHERE player_id = ?`, [playerId]);
  if (!playerData) {
    throw new Error(`Player with id ${playerId} not found`);
  }
  const playerHistory: PlayerHistory = {
    playerInfo: playerData,
    regularSeasons: regularSeasons,
    playoffSeasons: playoffSeasons,
    skills: skills,
    year: currentYear,
  };
  return playerHistory;
};

export { generatePlayer, fetchPlayerHistory };
