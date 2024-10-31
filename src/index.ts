import { faker } from '@faker-js/faker/locale/en_US';

import { createTables, openDb } from './db';
import { InsertableRecord } from './data/sqlTypes';
import { PlayerRaw } from './data';
import { createTeams, getTeamId, getTeamPlayers } from './core/entities/team';
import * as core from './core';
import { getPlayerFromHistory } from './core/entities/player';
import { simulateMatch } from './core/simulation/match';
import { formatTeamBoxScore } from './display/boxscore';

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
    age: 25,
    height: 78,
    weight: 200,
    wingspan: 78,

    // Career Info
    career_status: 'Active',
    experience: 0,
  };

  return player;
};

async function seedDb() {
  await createTables();
  const db = await openDb();
  // Insert teams
  await createTeams();

  const teamIds = await Promise.all([
    getTeamId('Boston'),
    getTeamId('Philadelphia')
  ]);

  // Insert 10 players and store their IDs
  const team1Ids: number[] = [];
  const team2Ids: number[] = [];

  // team 1
  const player1 = await core.createPlayer(generatePlayer(), teamIds[0], core.generatePlayerSkills(1, 2024, teamIds[0], 20, 20), 2024, 'PG');
  const player2 = await core.createPlayer(generatePlayer(), teamIds[0], core.generatePlayerSkills(2, 2024, teamIds[0], 20, 20), 2024, 'SG');
  const player3 = await core.createPlayer(generatePlayer(), teamIds[0], core.generatePlayerSkills(3, 2024, teamIds[0], 70, 70), 2024, 'SF');
  const player4 = await core.createPlayer(generatePlayer(), teamIds[0], core.generatePlayerSkills(4, 2024, teamIds[0], 20, 20), 2024, 'PF');
  const player5 = await core.createPlayer(generatePlayer(), teamIds[0], core.generatePlayerSkills(5, 2024, teamIds[0], 20, 20), 2024, 'C');
  team1Ids.push(player1, player2, player3, player4, player5);

  // team 2
  const player6 = await core.createPlayer(generatePlayer(), teamIds[1], core.generatePlayerSkills(6, 2024, teamIds[1], 20, 20), 2024, 'PG');
  const player7 = await core.createPlayer(generatePlayer(), teamIds[1], core.generatePlayerSkills(7, 2024, teamIds[1], 70, 70), 2024, 'SG');
  const player8 = await core.createPlayer(generatePlayer(), teamIds[1], core.generatePlayerSkills(8, 2024, teamIds[1], 20, 20), 2024, 'SF');
  const player9 = await core.createPlayer(generatePlayer(), teamIds[1], core.generatePlayerSkills(9, 2024, teamIds[1], 20, 20), 2024, 'PF');
  const player10 = await core.createPlayer(generatePlayer(), teamIds[1], core.generatePlayerSkills(10, 2024, teamIds[1], 20, 20), 2024, 'C');
  team2Ids.push(player6, player7, player8, player9, player10);

  console.log('team1Ids', team1Ids);
  console.log('team2Ids', team2Ids);

  return teamIds;
}

async function getLineup(teamId: number, teamName: string) {
  const playerHistories = await getTeamPlayers(teamId, 2024);
  const lineup: core.Lineup = { team: teamName, players: playerHistories.map((ph) => getPlayerFromHistory(ph)) };
  return lineup;
}

async function main() {
  // const teamIds = await seedDb();
  const team1 = await getLineup(1, 'Boston Celtics');
  const team2 = await getLineup(2, 'Philadelphia 76ers');

  // console.log(JSON.stringify(team1, null, 2));
  // console.log(JSON.stringify(team2, null, 2));

  const match = simulateMatch({ homeTeam: team1, awayTeam: team2 });
  console.log('\nBOSTON CELTICS');
  console.log(formatTeamBoxScore(match.homeTeamStats.map(stats => ({
    name: stats.name,
    minutes: Math.round(stats.seconds / 60),
    stats
  }))));

  console.log('\nPHILADELPHIA 76ERS');
  console.log(formatTeamBoxScore(match.awayTeamStats.map(stats => ({
    name: stats.name,
    minutes: Math.round(stats.seconds / 60),
    stats
  }))));
}

main().catch((err) => {
  console.error(err);
});
