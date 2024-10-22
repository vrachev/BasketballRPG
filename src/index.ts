import { createTables } from './db';
import * as core from './core';

async function main() {
  await createTables();

  // Insert sample data
  // await core.fetchData.insertPlayer(core.generatePlayer());
  // await core.fetchData.insertPlayer(core.generatePlayer());

  // await core.fetchData.insertTeam(core.generateTeam());
  // await core.fetchData.insertTeamSeason(core.generateTeamSeason(1, 2024));
  // await core.fetchData.insertTeamSeason(core.generateTeamSeason(1, 2024));
  // await core.fetchData.insertTeamSeason(core.generateTeamSeason(2, 2024));

  // Retrieve and log all users
  // const players = await core.fetchData.getPlayers();
  // console.log('Players:', players);

  // const teams = await core.fetchData.getTeams();
  // console.log('Teams:', teams);

  // const teamSeasons = await core.fetchData.getTeamSeasons();
  // console.log('Team Seasons:', teamSeasons);
  const player1 = await core.getPlayer(1);
  console.log('Player 2:', player1);
}

main().catch((err) => {
  console.error(err);
});
