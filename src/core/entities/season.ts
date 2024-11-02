import { SEASON_TABLE } from '../../data/constants';
import { Season } from '../../data/schemas/season';
import { InsertableRecord } from '../../data/sqlTypes';
import { insert, openDb } from '../../db';

export const createSeason = async (startYear: number, endYear: number): Promise<number> => {
  const seasonRecord: InsertableRecord<Season> = {
    start_year: startYear,
    end_year: endYear
  };
  return await insert(seasonRecord, SEASON_TABLE);
};

export const getSeason = async (startingYear: number): Promise<Season> => {
  const db = await openDb();
  const seasonRecord = await db.get<Season>(`SELECT * FROM ${SEASON_TABLE} WHERE start_year = ?`, [startingYear]);
  if (!seasonRecord) {
    throw new Error(`Season with starting year ${startingYear} not found`);
  }

  return seasonRecord;
};
