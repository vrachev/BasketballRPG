import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

import { 
  SchemaTs,
  playerSchemaSql, 
  playerSchema, 
  teamSchemaSql, 
  teamSchema, 
  PLAYER_TABLE, 
  TEAM_TABLE 
} from '../data';

const DB_PATH = path.join(process.cwd(), 'sqlite', 'database.db');

// Enable sqlite3 verbose mode to get more debugging info
sqlite3.verbose();

export async function openDb() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}

export async function createTables() {
  const db = await openDb();
  
  const createTable = async (tableName: string, schema: Record<string, string>) => {
    const columnDefinitions = Object.entries(schema)
      .map(([name, type]) => `${name} ${type}`)
      .join(', ');
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${columnDefinitions}
      );
    `);
  };

  await createTable(PLAYER_TABLE, playerSchemaSql);
  await createTable(TEAM_TABLE, teamSchemaSql);
}

async function insert<T extends Record<string, any>>(object: SchemaTs<T>) {
  const db = await openDb();
  const columns = Object.keys(object).join(', ');
  const placeholders = Object.keys(object).map(() => '?').join(', ');
  const values = Object.values(object);
  await db.run(`INSERT INTO ${PLAYER_TABLE} (${columns}) VALUES (${placeholders})`, values);
}

export async function insertPlayer(player: playerSchema) {
  await insert(player);
}

export async function getPlayers() {
  const db = await openDb();
  return db.all(`SELECT * FROM ${PLAYER_TABLE}`);
}
