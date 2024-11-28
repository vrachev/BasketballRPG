import type { Kysely } from 'kysely';
import {
  GAME_RESULT_TABLE,
  PLAYER_GAME_RESULT_TABLE,
  PLAYER_SEASON_TABLE,
  PLAYER_SKILLS_TABLE,
  PLAYER_TABLE,
  SEASON_TABLE,
  TEAM_SEASON_TABLE,
  TEAM_TABLE
} from '../constants.js';

// TODO:
// 1) Use table constants for foreign keys (eg: `${TEAM_TABLE}.id`)
// 2) Use StatlineRaw type instead of hardcoding statline columns

export async function up(db: Kysely<any>) {
  // Create seasons table
  await db.schema
    .createTable(SEASON_TABLE)
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey().notNull())
    .addColumn('start_year', 'integer', (col) => col.notNull())
    .addColumn('end_year', 'integer', (col) => col.notNull())
    .execute();

  // Create teams table
  await db.schema
    .createTable(TEAM_TABLE)
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey().notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('city', 'text', (col) => col.notNull())
    .addColumn('abbreviation', 'text', (col) => col.notNull())
    .addColumn('conference', 'text', (col) => col.notNull())
    .addColumn('division', 'text', (col) => col.notNull())
    .execute();

  // Create players table
  await db.schema
    .createTable(PLAYER_TABLE)
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey().notNull())
    .addColumn('first_name', 'text', (col) => col.notNull())
    .addColumn('last_name', 'text', (col) => col.notNull())
    .addColumn('full_name', 'text', (col) => col.notNull())
    .addColumn('age', 'real', (col) => col.notNull())
    .addColumn('height', 'real', (col) => col.notNull())
    .addColumn('weight', 'real', (col) => col.notNull())
    .addColumn('wingspan', 'real', (col) => col.notNull())
    .addColumn('career_status', 'text', (col) => col.notNull())
    .addColumn('experience', 'integer', (col) => col.notNull())
    .addColumn('is_starting', 'integer', (col) => col.notNull())
    .execute();

  // Create team_seasons table
  await db.schema
    .createTable(TEAM_SEASON_TABLE)
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey().notNull())
    .addColumn('team_id', 'integer', (col) => col.references(`${TEAM_TABLE}.id`).notNull())
    .addColumn('season_id', 'integer', (col) => col.references(`${SEASON_TABLE}.id`).notNull())
    .addColumn('games_played', 'integer', (col) => col.notNull())
    .addColumn('wins', 'integer', (col) => col.notNull())
    .addColumn('losses', 'integer', (col) => col.notNull())
    .addColumn('conference_rank', 'integer', (col) => col.notNull())
    .addColumn('playoff_seed', 'integer', (col) => col.notNull())
    .addColumn('secs_played', 'integer', (col) => col.notNull())
    .addColumn('fga', 'integer', (col) => col.notNull())
    .addColumn('fgm', 'integer', (col) => col.notNull())
    .addColumn('two_fga', 'integer', (col) => col.notNull())
    .addColumn('two_fgm', 'integer', (col) => col.notNull())
    .addColumn('three_fga', 'integer', (col) => col.notNull())
    .addColumn('three_fgm', 'integer', (col) => col.notNull())
    .addColumn('ftm', 'integer', (col) => col.notNull())
    .addColumn('fta', 'integer', (col) => col.notNull())
    .addColumn('off_reb', 'integer', (col) => col.notNull())
    .addColumn('def_reb', 'integer', (col) => col.notNull())
    .addColumn('reb', 'integer', (col) => col.notNull())
    .addColumn('ast', 'integer', (col) => col.notNull())
    .addColumn('stl', 'integer', (col) => col.notNull())
    .addColumn('blk', 'integer', (col) => col.notNull())
    .addColumn('tov', 'integer', (col) => col.notNull())
    .addColumn('fouls', 'integer', (col) => col.notNull())
    .addColumn('pts', 'integer', (col) => col.notNull())
    .execute();

  // Create player_seasons table
  await db.schema
    .createTable(PLAYER_SEASON_TABLE)
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey().notNull())
    .addColumn('team_id', 'integer', (col) => col.references(`${TEAM_TABLE}.id`).notNull())
    .addColumn('player_id', 'integer', (col) => col.references(`${PLAYER_TABLE}.id`).notNull())
    .addColumn('season_id', 'integer', (col) => col.references(`${SEASON_TABLE}.id`).notNull())
    .addColumn('season_type', 'text', (col) => col.notNull())
    .addColumn('position', 'text', (col) => col.notNull())
    .addColumn('games_played', 'integer', (col) => col.notNull())
    .addColumn('games_started', 'integer', (col) => col.notNull())
    .addColumn('wins', 'integer', (col) => col.notNull())
    .addColumn('losses', 'integer', (col) => col.notNull())
    .addColumn('secs_played', 'integer', (col) => col.notNull())
    .addColumn('fga', 'integer', (col) => col.notNull())
    .addColumn('fgm', 'integer', (col) => col.notNull())
    .addColumn('two_fga', 'integer', (col) => col.notNull())
    .addColumn('two_fgm', 'integer', (col) => col.notNull())
    .addColumn('three_fga', 'integer', (col) => col.notNull())
    .addColumn('three_fgm', 'integer', (col) => col.notNull())
    .addColumn('ftm', 'integer', (col) => col.notNull())
    .addColumn('fta', 'integer', (col) => col.notNull())
    .addColumn('off_reb', 'integer', (col) => col.notNull())
    .addColumn('def_reb', 'integer', (col) => col.notNull())
    .addColumn('reb', 'integer', (col) => col.notNull())
    .addColumn('ast', 'integer', (col) => col.notNull())
    .addColumn('stl', 'integer', (col) => col.notNull())
    .addColumn('blk', 'integer', (col) => col.notNull())
    .addColumn('tov', 'integer', (col) => col.notNull())
    .addColumn('fouls', 'integer', (col) => col.notNull())
    .addColumn('pts', 'integer', (col) => col.notNull())
    .execute();

  // Create player_skills table
  await db.schema
    .createTable(PLAYER_SKILLS_TABLE)
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey().notNull())
    .addColumn('team_id', 'integer', (col) => col.references(`${TEAM_TABLE}.id`).notNull())
    .addColumn('player_id', 'integer', (col) => col.references(`${PLAYER_TABLE}.id`).notNull())
    .addColumn('season_id', 'integer', (col) => col.references(`${SEASON_TABLE}.id`).notNull())
    // Physical Skills
    .addColumn('strength', 'real', (col) => col.notNull())
    .addColumn('speed', 'real', (col) => col.notNull())
    .addColumn('lateral_quickness', 'real', (col) => col.notNull())
    .addColumn('shiftiness', 'real', (col) => col.notNull())
    .addColumn('vertical_jump', 'real', (col) => col.notNull())
    .addColumn('endurance', 'real', (col) => col.notNull())
    // Shooting Skills
    .addColumn('free_throw', 'real', (col) => col.notNull())
    .addColumn('inside', 'real', (col) => col.notNull())
    .addColumn('layup', 'real', (col) => col.notNull())
    .addColumn('dunk', 'real', (col) => col.notNull())
    .addColumn('floater', 'real', (col) => col.notNull())
    .addColumn('turnaround', 'real', (col) => col.notNull())
    .addColumn('post', 'real', (col) => col.notNull())
    .addColumn('step_back', 'real', (col) => col.notNull())
    .addColumn('mid_range', 'real', (col) => col.notNull())
    .addColumn('two_point_fadeaway', 'real', (col) => col.notNull())
    .addColumn('three_point_catch_and_shoot', 'real', (col) => col.notNull())
    .addColumn('three_point_corner', 'real', (col) => col.notNull())
    .addColumn('three_point_step_back', 'real', (col) => col.notNull())
    .addColumn('three_point_pull_up', 'real', (col) => col.notNull())
    .addColumn('three_point_deep', 'real', (col) => col.notNull())
    // IQ
    .addColumn('offensive_iq', 'real', (col) => col.notNull())
    .addColumn('defensive_iq', 'real', (col) => col.notNull())
    .addColumn('patience', 'real', (col) => col.notNull())
    // Intangibles
    .addColumn('grit', 'real', (col) => col.notNull())
    .addColumn('leadership', 'real', (col) => col.notNull())
    .addColumn('clutch_gene', 'real', (col) => col.notNull())
    .addColumn('offensive_motor', 'real', (col) => col.notNull())
    .addColumn('defensive_motor', 'real', (col) => col.notNull())
    .addColumn('streakiness', 'real', (col) => col.notNull())
    .addColumn('handle_pressure', 'real', (col) => col.notNull())
    .addColumn('driven', 'real', (col) => col.notNull())
    .addColumn('emotional', 'real', (col) => col.notNull())
    // Basketball skills
    .addColumn('dribbling', 'real', (col) => col.notNull())
    .addColumn('playmaking', 'real', (col) => col.notNull())
    .addColumn('passing', 'real', (col) => col.notNull())
    .addColumn('offensive_rebounding', 'real', (col) => col.notNull())
    .addColumn('defensive_rebounding', 'real', (col) => col.notNull())
    .addColumn('post_game', 'real', (col) => col.notNull())
    // Tendencies
    .addColumn('tendency_pass', 'real', (col) => col.notNull())
    .addColumn('tendency_score', 'real', (col) => col.notNull())
    .addColumn('tendency_catch_and_shoot', 'real', (col) => col.notNull())
    .addColumn('tendency_pull_up', 'real', (col) => col.notNull())
    .addColumn('tendency_step_back', 'real', (col) => col.notNull())
    .addColumn('tendency_fadeaway', 'real', (col) => col.notNull())
    .addColumn('tendency_mid_range', 'real', (col) => col.notNull())
    .addColumn('tendency_corner_three', 'real', (col) => col.notNull())
    .addColumn('tendency_above_the_break_three', 'real', (col) => col.notNull())
    .addColumn('tendency_drive_to_basket', 'real', (col) => col.notNull())
    .addColumn('tendency_rim', 'real', (col) => col.notNull())
    .addColumn('tendency_paint', 'real', (col) => col.notNull())
    .addColumn('tendency_free_throw_drawing', 'real', (col) => col.notNull())
    .addColumn('tendency_offensive_rebounding', 'real', (col) => col.notNull())
    .addColumn('tendency_defensive_rebounding', 'real', (col) => col.notNull())
    .execute();

  // Create game_results table
  await db.schema
    .createTable(GAME_RESULT_TABLE)
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey().notNull())
    .addColumn('home_team_id', 'integer', (col) => col.references(`${TEAM_TABLE}.id`).notNull())
    .addColumn('away_team_id', 'integer', (col) => col.references(`${TEAM_TABLE}.id`).notNull())
    .addColumn('home_team_season_id', 'integer', (col) => col.references(`${TEAM_SEASON_TABLE}.id`).notNull())
    .addColumn('away_team_season_id', 'integer', (col) => col.references(`${TEAM_SEASON_TABLE}.id`).notNull())
    .addColumn('season_id', 'integer', (col) => col.references(`${SEASON_TABLE}.id`).notNull())
    .addColumn('season_type', 'text', (col) => col.notNull())
    .addColumn('date', 'text', (col) => col.notNull())
    .addColumn('winner_id', 'integer', (col) => col.references(`${TEAM_TABLE}.id`).notNull())
    .addColumn('loser_id', 'integer', (col) => col.references(`${TEAM_TABLE}.id`).notNull())
    // Home team stats (prefixed with h_)
    .addColumn('h_secs_played', 'integer', (col) => col.notNull())
    .addColumn('h_fga', 'integer', (col) => col.notNull())
    .addColumn('h_fgm', 'integer', (col) => col.notNull())
    .addColumn('h_two_fga', 'integer', (col) => col.notNull())
    .addColumn('h_two_fgm', 'integer', (col) => col.notNull())
    .addColumn('h_three_fga', 'integer', (col) => col.notNull())
    .addColumn('h_three_fgm', 'integer', (col) => col.notNull())
    .addColumn('h_ftm', 'integer', (col) => col.notNull())
    .addColumn('h_fta', 'integer', (col) => col.notNull())
    .addColumn('h_off_reb', 'integer', (col) => col.notNull())
    .addColumn('h_def_reb', 'integer', (col) => col.notNull())
    .addColumn('h_reb', 'integer', (col) => col.notNull())
    .addColumn('h_ast', 'integer', (col) => col.notNull())
    .addColumn('h_stl', 'integer', (col) => col.notNull())
    .addColumn('h_blk', 'integer', (col) => col.notNull())
    .addColumn('h_tov', 'integer', (col) => col.notNull())
    .addColumn('h_fouls', 'integer', (col) => col.notNull())
    .addColumn('h_pts', 'integer', (col) => col.notNull())
    // Away team stats (prefixed with a_)
    .addColumn('a_secs_played', 'integer', (col) => col.notNull())
    .addColumn('a_fga', 'integer', (col) => col.notNull())
    .addColumn('a_fgm', 'integer', (col) => col.notNull())
    .addColumn('a_two_fga', 'integer', (col) => col.notNull())
    .addColumn('a_two_fgm', 'integer', (col) => col.notNull())
    .addColumn('a_three_fga', 'integer', (col) => col.notNull())
    .addColumn('a_three_fgm', 'integer', (col) => col.notNull())
    .addColumn('a_ftm', 'integer', (col) => col.notNull())
    .addColumn('a_fta', 'integer', (col) => col.notNull())
    .addColumn('a_off_reb', 'integer', (col) => col.notNull())
    .addColumn('a_def_reb', 'integer', (col) => col.notNull())
    .addColumn('a_reb', 'integer', (col) => col.notNull())
    .addColumn('a_ast', 'integer', (col) => col.notNull())
    .addColumn('a_stl', 'integer', (col) => col.notNull())
    .addColumn('a_blk', 'integer', (col) => col.notNull())
    .addColumn('a_tov', 'integer', (col) => col.notNull())
    .addColumn('a_fouls', 'integer', (col) => col.notNull())
    .addColumn('a_pts', 'integer', (col) => col.notNull())
    .execute();

  // Create player_game_results table
  await db.schema
    .createTable(PLAYER_GAME_RESULT_TABLE)
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey().notNull())
    .addColumn('player_id', 'integer', (col) => col.references(`${PLAYER_TABLE}.id`).notNull())
    .addColumn('game_result_id', 'integer', (col) => col.references(`${GAME_RESULT_TABLE}.id`).notNull())
    .addColumn('team_id', 'integer', (col) => col.references(`${TEAM_TABLE}.id`).notNull())
    .addColumn('season_id', 'integer', (col) => col.references(`${SEASON_TABLE}.id`).notNull())
    .addColumn('season_type', 'text', (col) => col.notNull())
    .addColumn('win', 'integer', (col) => col.notNull())
    .addColumn('date', 'text', (col) => col.notNull())
    .addColumn('secs_played', 'integer', (col) => col.notNull())
    .addColumn('fga', 'integer', (col) => col.notNull())
    .addColumn('fgm', 'integer', (col) => col.notNull())
    .addColumn('two_fga', 'integer', (col) => col.notNull())
    .addColumn('two_fgm', 'integer', (col) => col.notNull())
    .addColumn('three_fga', 'integer', (col) => col.notNull())
    .addColumn('three_fgm', 'integer', (col) => col.notNull())
    .addColumn('ftm', 'integer', (col) => col.notNull())
    .addColumn('fta', 'integer', (col) => col.notNull())
    .addColumn('off_reb', 'integer', (col) => col.notNull())
    .addColumn('def_reb', 'integer', (col) => col.notNull())
    .addColumn('reb', 'integer', (col) => col.notNull())
    .addColumn('ast', 'integer', (col) => col.notNull())
    .addColumn('stl', 'integer', (col) => col.notNull())
    .addColumn('blk', 'integer', (col) => col.notNull())
    .addColumn('tov', 'integer', (col) => col.notNull())
    .addColumn('fouls', 'integer', (col) => col.notNull())
    .addColumn('pts', 'integer', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable(PLAYER_GAME_RESULT_TABLE).execute();
  await db.schema.dropTable(GAME_RESULT_TABLE).execute();
  await db.schema.dropTable(PLAYER_SKILLS_TABLE).execute();
  await db.schema.dropTable(PLAYER_SEASON_TABLE).execute();
  await db.schema.dropTable(TEAM_SEASON_TABLE).execute();
  await db.schema.dropTable(PLAYER_TABLE).execute();
  await db.schema.dropTable(TEAM_TABLE).execute();
  await db.schema.dropTable(SEASON_TABLE).execute();
}
