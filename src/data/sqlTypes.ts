type SQLiteType = 'INTEGER' | 'TEXT' | 'REAL' | 'INTEGER PRIMARY KEY AUTOINCREMENT';
type ForeignKeyType = [string, string, string]; // [localColumn, referencedTable, referencedColumn]

type MapSQLiteTypeToTS<T extends SQLiteType | ForeignKeyType> =
  T extends 'INTEGER' | 'INTEGER PRIMARY KEY AUTOINCREMENT' ? number :
  T extends 'TEXT' ? string :
  T extends 'REAL' ? number :
  T extends ForeignKeyType ? never :
  never;

type SchemaTs<T extends Record<string, SQLiteType | ForeignKeyType>> = {
  [K in keyof Omit<T, 'id'>]: MapSQLiteTypeToTS<T[K]>
};

type TableSchemaSql = Record<string, SQLiteType | ForeignKeyType>;

export { SchemaTs, TableSchemaSql, ForeignKeyType };
