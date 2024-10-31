import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

import * as Data from '../data';
import assert from 'assert';

const DB_PATH = path.join(process.cwd(), 'sqlite', 'database.db');

// Enable sqlite3 verbose mode to get more debugging info
sqlite3.verbose();

async function openDb() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

async function createTables() {
  const db = await openDb();

  const createTable = async (tableName: string, schema: Data.TableSchemaSql) => {
    const columnDefinitions = Object.entries(schema)
      .map(([name, type]) => {
        if (Data.isForeignKeyType(type)) {
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

  await createTable(Data.PLAYER_TABLE, Data.playerSchemaSql);
  await createTable(Data.PLAYER_SKILLS_TABLE, Data.playerSkillsSchemaSql);
  await createTable(Data.PLAYER_SEASON_TABLE, Data.playerSeasonSchemaSql);
  await createTable(Data.TEAM_TABLE, Data.teamSchemaSql);
  await createTable(Data.TEAM_SEASON_TABLE, Data.teamSeasonSchemaSql);
  await createTable(Data.MATCH_TABLE, Data.matchSchemaSql);
}

async function insert<T extends Record<string, any>>(object: Data.SchemaTs<T>, tableName: string): Promise<number> {
  const db = await openDb();
  const columns = Object.keys(object).join(', ');
  const placeholders = Object.keys(object).map(() => '?').join(', ');
  const values = Object.values(object);
  const result = await db.run(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`, values);
  assert.strictEqual(typeof result.lastID, 'number', 'lastID must be a number');
  return result.lastID as number;
}

export { openDb, createTables, insert };
