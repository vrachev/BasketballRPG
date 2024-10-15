import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

import { playerSchemaSql, playerSchema } from '../data/playerSchema';

const PLAYER_TABLE = 'players';
const DB_PATH = path.join(process.cwd(), 'sqlite', 'database.db');

// Enable sqlite3 verbose mode to get more debugging info
sqlite3.verbose();

export async function openDb() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}

export async function createPlayersTable() {
  const db = await openDb();
  const columnDefinitions = Object.entries(playerSchemaSql)
    .map(([name, type]) => `${name} ${type}`)
    .join(', ');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS ${PLAYER_TABLE} (
      ${columnDefinitions}
    );
  `);
}

export async function insertPlayer(player: playerSchema) {
  const db = await openDb();
  const columns = Object.keys(player).join(', ');
  const placeholders = Object.keys(player).map(() => '?').join(', ');
  const values = Object.values(player);
  await db.run(`INSERT INTO players (${columns}) VALUES (${placeholders})`, values);
}

export async function getPlayers() {
  const db = await openDb();
  return db.all(`SELECT * FROM ${PLAYER_TABLE}`);
}
