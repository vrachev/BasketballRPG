type SQLiteType = 'INTEGER' | 'TEXT' | 'REAL' | 'INTEGER PRIMARY KEY AUTOINCREMENT';
type ForeignKeyType = [string, string, string]; // [localColumn, referencedTable, referencedColumn]

type MapSQLiteTypeToTS<T extends SQLiteType | ForeignKeyType> =
  T extends 'INTEGER' | 'INTEGER PRIMARY KEY AUTOINCREMENT' ? number :
  T extends 'TEXT' ? string :
  T extends 'REAL' ? number :
  T extends ForeignKeyType ? ForeignKeyType :
  never;
  
type TableSchemaSql = Record<string, SQLiteType | ForeignKeyType>;
type SchemaTs<T extends TableSchemaSql> = FilteredKeys<T>;

// Helper types to exclude id and foreign key from the schema
type ExcludeIdAndForeignKey<K extends keyof any, T> = 
  K extends 'id' ? never : 
  T extends ForeignKeyType ? never : 
  K;
type FilteredKeys<T extends TableSchemaSql> = {
  [K in keyof T as ExcludeIdAndForeignKey<K, T[K]>]: MapSQLiteTypeToTS<T[K]>
};

// Type guard to check if a value is a ForeignKeyType
function isForeignKeyType(value: any): value is ForeignKeyType {
  return Array.isArray(value) && value.length === 3 && typeof value[1] === 'string';
}

export { SchemaTs, TableSchemaSql, ForeignKeyType, isForeignKeyType };
