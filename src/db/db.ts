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

import { TableSchemaSql, ForeignKeyType } from '../data/sqlTypes';

const DB_PATH = path.join(process.cwd(), 'sqlite', 'database.db');

// Enable sqlite3 verbose mode to get more debugging info
sqlite3.verbose();

async function openDb() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}

async function createTables() {
  const db = await openDb();
  
  const createTable = async (tableName: string, schema: TableSchemaSql) => {
    const columnDefinitions = Object.entries(schema)
      .map(([name, type]) => {
        if (Array.isArray(type)) {
          return `FOREIGN KEY (${type[0]}) REFERENCES ${type[1]}(${type[2]})`;
        }
        return `${name} ${type}`;
      })
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

async function insert<T extends Record<string, any>>(object: SchemaTs<T>, tableName: string) {
  const db = await openDb();
  const columns = Object.keys(object).join(', ');
  const placeholders = Object.keys(object).map(() => '?').join(', ');
  const values = Object.values(object);
  await db.run(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`, values);
}

export { openDb, createTables, insert };
