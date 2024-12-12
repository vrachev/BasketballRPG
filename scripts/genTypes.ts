import { execSync } from 'child_process';
import { unlinkSync } from 'fs';
import { migrateDb } from '../src/lib/data/migrate.js';

const TEMP_DB_PATH = 'temp.db';

try {
  await migrateDb(TEMP_DB_PATH);

  // Generate types from the temporary database
  execSync(`npx kysely-codegen --out-file ./src/lib/data/schema.d.ts --dialect sqlite --url ${TEMP_DB_PATH}`, { stdio: 'inherit' });

  // Clean up the temporary database
  unlinkSync(TEMP_DB_PATH);
} catch (error) {
  console.error('Error generating types:', error);

  // Attempt to clean up temp db even if there's an error
  try {
    unlinkSync(TEMP_DB_PATH);
  } catch { }

  process.exit(1);
}
