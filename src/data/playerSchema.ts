const playerSchemaSql = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  first_name: 'TEXT',
  last_name: 'TEXT',
  full_name: 'TEXT',
  age: 'INTEGER',
  height: 'REAL',
  weight: 'REAL',
  team: 'TEXT',
  position: 'TEXT',
  status: 'TEXT',
  offensive_rating: 'REAL',
  defensive_rating: 'REAL',
  grit: 'REAL',
  leadership: 'REAL',
  experience: 'INTEGER',
} as const;

type SQLiteType = 'INTEGER' | 'TEXT' | 'REAL' | 'INTEGER PRIMARY KEY AUTOINCREMENT';

type MapSQLiteTypeToTS<T extends SQLiteType> =
  T extends 'INTEGER' | 'INTEGER PRIMARY KEY AUTOINCREMENT' ? number :
  T extends 'TEXT' ? string :
  T extends 'REAL' ? number :
  never;

type playerSchema = {
  [K in keyof Omit<typeof playerSchemaSql, 'id'>]: MapSQLiteTypeToTS<typeof playerSchemaSql[K]>
};

export { playerSchemaSql, playerSchema };
