import { Kysely } from 'kysely';
import { TEAM_SEASON_TABLE } from '../constants';

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .addColumn('conference_wins', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .addColumn('conference_losses', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .addColumn('division_wins', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .addColumn('division_losses', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .addColumn('home_wins', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .addColumn('home_losses', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .addColumn('away_wins', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .addColumn('away_losses', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .dropColumn('conference_wins')
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .dropColumn('conference_losses')
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .dropColumn('division_wins')
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .dropColumn('division_losses')
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .dropColumn('home_wins')
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .dropColumn('home_losses')
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .dropColumn('away_wins')
    .execute();

  await db.schema
    .alterTable(TEAM_SEASON_TABLE)
    .dropColumn('away_losses')
    .execute();
}
