import { SQLocalKysely } from 'sqlocal/kysely';
import { Kysely } from 'kysely';
import type { Generated } from 'kysely';
import './data/migrate.js'; // run migrations


const { dialect } = new SQLocalKysely('groceries.sqlite3');
const db = new Kysely<DB>({ dialect });

// Create groceries table
await db.schema
  .createTable('groceries')
  .ifNotExists()
  .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
  .addColumn('name', 'text', (col) => col.notNull())
  .execute();

// Insert some sample data
await db
  .insertInto('groceries')
  .values([
    { name: 'Apples' },
    { name: 'Bananas' },
    { name: 'Bread' },
    { name: 'Milk' }
  ])
  .execute();

// Define your schema 
// (passed to the Kysely generic above)
type DB = {
  groceries: {
    id: Generated<number>;
    name: string;
  };
};

// Make type-safe queries
const data = await db
  .selectFrom('groceries')
  .select('name')
  .orderBy('name', 'asc')
  .execute();
console.log("VLADA", data);
