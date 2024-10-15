import { createTables } from './db';
import { insertPlayer, insertTeam, getPlayers, getTeams, generatePlayer, generateTeam } from './game';

async function main() {
  await createTables();

  // Insert sample data
  await insertPlayer(generatePlayer());
  await insertPlayer(generatePlayer());

  await insertTeam(generateTeam());
  await insertTeam(generateTeam());

  // Retrieve and log all users
  const users = await getPlayers();
  console.log('Players:', users);

  const teams = await getTeams();
  console.log('Teams:', teams);
}

main().catch((err) => {
  console.error(err);
});
