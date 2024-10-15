type SQLiteType = 'INTEGER' | 'TEXT' | 'REAL' | 'INTEGER PRIMARY KEY AUTOINCREMENT';

type MapSQLiteTypeToTS<T extends SQLiteType> =
  T extends 'INTEGER' | 'INTEGER PRIMARY KEY AUTOINCREMENT' ? number :
  T extends 'TEXT' ? string :
  T extends 'REAL' ? number :
  never;

type SchemaTs<T extends Record<string, SQLiteType>> = {
  [K in keyof Omit<T, 'id'>]: MapSQLiteTypeToTS<T[K]>
};

type TableSchemaSql = Record<string, SQLiteType>;

export { SchemaTs, TableSchemaSql };