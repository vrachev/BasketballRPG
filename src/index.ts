import { createTables } from './db';
import * as core from './core';

async function main() {
  await createTables();

  // Insert sample data
  await core.insertPlayer(core.generatePlayer());
  await core.insertPlayer(core.generatePlayer());

  await core.insertTeam(core.generateTeam());
  await core.insertTeam(core.generateTeam());

  await core.insertTeamSeason(core.generateTeamSeason(1, 2024));
  await core.insertTeamSeason(core.generateTeamSeason(2, 2024));

  // Retrieve and log all users
  const users = await core.getPlayers();
  console.log('Players:', users);

  const teams = await core.getTeams();
  console.log('Teams:', teams);

  const teamSeasons = await core.getTeamSeasons();
  console.log('Team Seasons:', teamSeasons);
}

main().catch((err) => {
  console.error(err);
});
