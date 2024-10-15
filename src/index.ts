import { createPlayersTable, insertPlayer, getPlayers } from './db/db';
import { generatePlayer } from './player/player';

async function main() {
  await createPlayersTable();

  // Insert sample data
  await insertPlayer(generatePlayer());
  await insertPlayer(generatePlayer());

  // Retrieve and log all users
  const users = await getPlayers();
  console.log('Users:', users);
}

main().catch((err) => {
  console.error(err);
});
