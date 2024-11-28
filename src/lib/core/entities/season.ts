import type { Insertable } from 'kysely';
import { db, SEASON_TABLE, type SeasonTable, type Season } from '../../data/index.js';

export const createSeason = async (startYear: number, endYear: number): Promise<number> => {
  const seasonRecord: Insertable<SeasonTable> = {
    start_year: startYear,
    end_year: endYear
  };
  return (await db
    .insertInto(SEASON_TABLE)
    .values(seasonRecord)
    .returning('id')
    .executeTakeFirstOrThrow()).id;
};

export const getSeason = async (startingYear: number): Promise<Season> => {
  const seasonRecord = await db
    .selectFrom(SEASON_TABLE)
    .selectAll()
    .where('start_year', '=', startingYear)
    .executeTakeFirstOrThrow();
  if (!seasonRecord) {
    throw new Error(`Season with starting year ${startingYear} not found`);
  }

  return seasonRecord;
};
